const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const get_account = require('mlar').mreq('services', 'account/search');
const update_balance = require('mlar').mreq('services', 'account/balanceupdate');
const md5hash = require('crypto');
const cache = require('mlar').mreq('services', 'cache/new');
const validator = require('mlar')('validators');
const assert = require('mlar')('assertions');
const createTransactionService  = require('mlar').mreq('services', 'transaction/new')
const generateRandom  = require('mlar')('testutils').generateRandom;
const moment = require('moment');
let currencies = require('mlar')('currencies');
//var normalize = require('./normalize');


/**
 * 
 * requestRef	number	Required A unique request reference
transactionRef	number	Required A unique transaction reference
authDetails		
type	string	Required The type of authorization method e.g OTP password
value	string	Required The authorization value
{
    "transactionRef": "5000",
    "requestRef": "5000",
    "authDetails": [{
        "type": "OTP",
        "value": "12344"
    }, {
        "type": "password",
        "value": "12344"
    }],
}
 */

var intrabankSpec = morx.spec({})  
                .build('channel', 'required:true') 
                .build('batchId', 'required:false') 
                .build('statusWebHook', 'required:false') 
                .build('transactions', 'required:true')
                .build('referenceId', 'required:true')
                .build('sourceAccount', 'required:true')
                .build('sourceAccountName', 'required:true')
                .build('sourceAmount', 'required:true')
                .build('sourceCurrency', 'required:true')
                .build('sourceNarration', 'required:true')
                .build('transactions', 'required:true')
                .build('context', 'required:true')
                .end(); 




module.exports = (data) => {
    const d = q.defer()
    let transactions = null;
    let responseReferenceId = null;
    
    q.fcall(async function() {
        const result = morx.validate(data, intrabankSpec, {throw_error: true});
        const params = result.params;

        transactions = JSON.parse(JSON.stringify(params.transactions));

        let sourceAccount = await models.account.findOne({where: {accountNumber: params.sourceAccount}});
        if (!sourceAccount || !sourceAccount.id) throw new Error("Could not find the source account");
        if (!sourceAccount.bankId) throw new Error("Source account's bank not found");
        if (parseFloat(params.sourceAmount < 0)) throw new Error("Source amount cannot be negative");
        if (parseFloat(params.sourceAmount !== 0)) throw new Error("Source amount cannot be zero");

        //get number of amounts;
        let destinationAmounts = transactions.filter(tx=> tx.amount);
        if (destinationAmounts.length !== transactions.length) throw new Error("Each transaction should have a positive amount");


        let invalidDestinationAmounts = transactions.filter(tx=>parseFloat(tx.amount) === 0 || parseFloat(tx.amount) < 0 );
        if (invalidDestinationAmounts.length) throw new Error("No amount should be less than or equal to 0");

        // source amount should be equal to the combination of all the amounts.
        let sumOfDestinationAmounts = destinationAmounts.map(tx => parseFloat(tx.amount)).reduce((a, b) => a + b, 0);
        if (parseFloat(params.sourceAmount) !== sumOfDestinationAmounts) throw new Error("Source amount should be the sum of all destination amounts");

        let currency = params.sourceCurrency.toUpperCase();
        if (!currencies[currency]) throw new Error("Invalid currency: " + params.sourceCurrency);

        transactions.forEach(tx=> {
            ['destinationAccount', 'destinationAccountName', 'destinationBankCode', 'destinationNarration']
                .forEach(field=> {
                    if (!tx[field]) {
                        throw new Error(field + " required in every transaction");
                    }
                })
        });
        let destinationAccounts = transactions.map(tx=> tx.destinationAccount);

        return [models.account.findAll({where: {accountNumber: {$in: destinationAccounts}}}), destinationAccounts, sourceAccount];
       //make sure that each transaction has  a destination account n
    })
    .spread((dest, initialDestAccounts, sourceAccount) => {
        // get destinationAccountsValidity 
        // if some of those destination accounts are invalid;
        let invalidErrors = [];
        let noBankIdErrors = [];
        let differentBankErrors = [];
        let sameBankErrors = [];

        let newDestAccounts = dest.map(acct=>acct.accountNumber);

        if (dest.length  <  initialDestAccounts.length) {

            initialDestAccounts.forEach(i => {
                if (!newDestAccounts.includes(i)) {
                    invalidErrors.push(i)
                }
            })
            
        }
        
        if (invalidErrors.length) throw new Error ('Destination account(s) ' +  invalidErrors.join(', ') + ' not found');
    
        dest.forEach(acct=> {
            if (!acct.bankId) {
                noBankIdErrors.push(acct.accountNumber)

            }   
            if (data.context === 'intra') {
                if (sourceAccount.bankId !== acct.bankId) {
                    differentBankErrors.push(acct.accountNumber)
                }
            }
            else {
                if (sourceAccount.bankId === acct.bankId) {
                    sameBankErrors.push(acct.accountNumber)
                }
            }
        })
        if (noBankIdErrors.length) throw new Error('No bank id associated with ' + noBankIdErrors.join(', '))
        if (differentBankErrors.length) throw new Error(differentBankErrors.join(', ') + ' not of the same bank with source account');
        if (sameBankErrors.length) throw new Error(sameBankErrors.join(', ') + ' is of the same bank as source account');
        
        
        let transactionData = [];
        let crTransaction = null;
        
        transactions.forEach(tx=> {
            let generalTxData = {
                amount: data.sourceAmount,
                currency: data.sourceCurrency,
                statusCode: "00",
                transactionType: "Sample",
                transactionTime: new Date(),
                valueDate: new Date(),
                channel:"OBTRF",
                status: 'PENDING-AUTH'
            }
            responseReferenceId = generateRandom('digits', 5) + '' +new Date().getTime();

            let drTransaction = {
                ...generalTxData,
                accountNumber: data.sourceAccount,
                narration: data.sourceNarration,
                debitOrCredit: "Dr",
                bankId: sourceAccount.bankId,
                referenceId:  responseReferenceId,
    
            } ;// for source account


            transactionData.push(drTransaction)
    
             crTransaction = {
                ...generalTxData,
                accountNumber: tx.destinationAccount,
                bankId: sourceAccount.bankId,
                debitOrCredit: "Cr",
                narration: tx.destinationNarration,
                referenceId:  generateRandom('digits', 5) + '' +new Date().getTime(),
                 status: "SUCCESSFUL"
            } // for dest account
            
            transactionData.push(crTransaction)
        });
        return [models.transaction.bulkCreate(transactionData), sourceAccount, crTransaction];
    })

    .spread(async (response, sourceAccount, crTransaction)=> {
        if (!response) throw new Error("could not create transactions");
        const OTP = (Date.now() + '').slice(0, 6);
        await cache({
            key: responseReferenceId + '' + sourceAccount.bankId,
            cache: {
                crTransaction,
                OTP
            },
            stringify_json: 1
        });

        response = {};

        response = {
            "status": "00",
            "message": "Kindly enter the OTP sent to ****1412 to complete the transaction",
            "data": {
                "errors": null,
                "error": null,
                "transactionRef": responseReferenceId,        
                "validTill": moment().add(5, 'hours').format('YYYYMMDDHHMMSS'),
                "expiryMinutes":1000,
                "statusWebHook": data.statusWebHook,
                "authDetails": [
                    {
                        "type":"otp",
                        "label":"6-digit OTP",
                        "Message":"Kindly enter the OTP sent to ****1412 to complete the transaction"
                    },
                    {
                        "type":"password",
                        "label":"internet banking password",
                        "Message":"Kindly enter your internet banking password"
                    }
                ]
            }
        }
        d.resolve(response);
    })

    .catch(err=> {
        console.log(err.stack);
        d.reject(err)
    })

    return d.promise
}
