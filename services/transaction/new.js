const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const get_account = require('mlar').mreq('services', 'account/search');
const update_balance = require('mlar').mreq('services', 'account/balanceupdate');
const md5hash = require('crypto');
const assert = require('mlar')('assertions');
const get_bank = require('mlar').mreq('services', 'bank/search');
const cache = require('mlar').mreq('services', 'cache/new');
const currencies = require('mlar')('currencies');

//var normalize = require('./normalize');


/**
 * amount	number	Required Transaction amount 1000.0
channel	string	Required Transaction channel POS
currency	string	Required A 3-character code that represents the currency USD
destinationAccount	string	Required Recipient’s account number in NUBAN format 0031633612
destinationAccountName	string	Required Recipient name Michael Alozie
destinationNarration	string	Required Transaction description thank you
referenceId	string	Required A unique internal reference to the specific transaction 1231234
sourceAccount	string	Required Sender’s account number in NUBAN format 2056829985
sourceAccountName	string	Required Sender account name Nedu Alo
sourceAmount	number	Required Transaction amount 1000.o
sourceCurrency	string	Required A 3-character code that represents the currency USD
sourceNarration	string	Required Sender transaction description thank you
{
    "amount": 5000,
    "destinationAccount": "5000",
    "currency": "5000",
    "destinationAccountName": "5000",
    "channel": "5000",
    "destinationNarration": "5000",
    "referenceId": "5000",
    "sourceAccount": "5000",
    "sourceAccountName": "5000",
    "sourceAmount": "5000",
    "sourceCurrency": "5000",
    "sourceNarration": "5000",
}
 */

var spec = morx.spec({})  
                .build('bankId', 'required:true') 
                .build('amount', 'required:true')
                .build('destinationAccount', 'required:true')
                .build('destinationBankCode', 'required:false')
                .build('currency', 'required:true')
                .build('destinationAccountName', 'required:true')
                .build('channel', 'required:true')
                .build('destinationNarration', 'required:true')
                .build('referenceId', 'required:true')
                .build('sourceAccount', 'required:true')
                .build('sourceAccountName', 'required:true')
                .build('sourceAmount', 'required:true')
                .build('sourceCurrency', 'required:true')
                .build('sourceNarration', 'required:true') 
                .build('context', 'required:true') 
                .end(); 



function service(data) {

    var d = q.defer();
    const response = {
        status: "success",
        data:{
        "errors": null,
        "error": null,
        "transactionRef": null,
        "validTill": null,
        "expiryMinutes": null,
        "authDetails": []
        }
      }

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;

        // destination account and source account cannot be the same
        assert.mustBeMutuallyExclusive([params.destinationAccount, params.sourceAccount], null, ['Destination Account','Source Account']);
        
        if (parseFloat(params.sourceAmount) < 0 || parseFloat(params.amount) < 0) {
            throw new Error("Amount cannot be a negative value");
        }
        let currency = params.sourceCurrency.toUpperCase();
        if (!currencies[currency]) throw new Error("Invalid currency");
        
        let destBank = null;
        if(params.destinationBankCode) {
            destBank = get_bank({
                bankCode: params.destinationBankCode
            })
        }


        return q.allSettled([params, destBank]);
    })
    .spread((params_, destBank_) => {
        const params = params_.value;
        const destBank = destBank_.value;
        ErrorLogger(destBank);

        if(params.destinationBankCode && !destBank) {
            throw new Error('Invalid destination bank code supplied');
        }

        const source = get_account({
            bankId: params.bankId,
            accountNumber: params.sourceAccount,
            ignore_customer_required: true,
            normalize_include_balance: true,
            fetch_one: true
        });

        const destination = get_account({
            bankId: (destBank && destBank.id) || params.bankId, // Use destBank id to handle interbank transfers
            accountNumber: params.destinationAccount,
            ignore_customer_required: true,
            normalize_include_balance: true,
            fetch_one: true
        });
        //return q.allSettled([params, source, destination]);

        return [
            params, 
            models.account.findOne({where: {accountNumber: params.sourceAccount}}),
            models.account.findOne({where: {accountNumber: params.destinationAccount}})]
    })
    .spread((params_, source_, destination_) => {
        let params = params_;
        let source = source_;
        let destination = destination_;

        if (params.context == 'inter') {
            if (destination.bankId == source.bankId) {
                throw new Error("Destination bank is the same as source bank")
            }
        }
        else {
            if (destination.bankId != source.bankId) {
                throw new Error("Destination bank is the not the same as source bank")
            }
        }

        if(!source) throw new Error('Invalid source account passed');
        if(!destination) throw new Error('Invalid destination account passed');
        if(source.availableBalance < params.amount) throw new Error('Insufficient balance');
        if(source.status.toLowerCase() !== 'active') throw new Error('Source account is not active');
        if(destination.status.toLowerCase() !== 'active') throw new Error('Destination account is not active');

        const sourcetx = {
            bankId: params.bankId,
            customerId: source.customerId,
            accountId: source.id,
            "accountNumber": params.sourceAccount,
            "amount": params.amount,
            "currency": params.currency,
            "transactionTime": new Date(),
            "valueDate": new Date(),
            "channel": "OBTRF",
            "status": "PENDING-AUTH",
            "statusCode": "02",
            "debitOrCredit": "Dr",
            "narration": params.sourceNarration,
            "transactionType": "OPEC",
            "referenceId": params.referenceId // Should be unique
        };

        const desttx = {
            bankId: destination.bankId,
            customerId: destination.customerId,
            accountId: destination.id,
            "accountNumber": destination.accountNumber,
            "amount": params.amount,
            "currency": params.currency,
            "status": "PENDING-AUTH",
            "statusCode": "02",
            "transactionTime": new Date(),
            "valueDate": new Date(),
            "channel": "OBTRF",
            "debitOrCredit": "Cr",
            "narration": params.destinationNarration,
            "transactionType": "OPEC",
            "referenceId": md5hash.createHash('md5').update(params.referenceId).digest('hex')
        };
       // d.resolve([params, source, destination]);

    //    const sourcedebit =  update_balance({
    //        id: source.id,
    //        value: params.amount,
    //        type: 'debit'
    //    });

    //    const deferreddestinationcredit = () =>  update_balance({
    //        id: destination.id,
    //        value: params.amount,
    //        type: 'credit'
    //    });

       return [params, source, destination, sourcetx, desttx]
    })
    .spread( (params, source, destination, sourcetx, destinationtx) => {


        const OTP = (Date.now() + '').slice(0, 6);
        return [
            models.transaction.create(sourcetx),
            cache({
                key: sourcetx.referenceId + '' + sourcetx.bankId, 
                cache: {
                    destinationtx,
                    OTP
                },
                stringify_json: 1
            }),
            source
        ]

    })
    .spread((sourcetx, destinationtx, source) => {
          let source_phone = source.phoneNumber ? source.phoneNumber.toString().slice(-4) : "source's phone number";
          response.status = "waitingforauth";
          response.data.transactionRef = sourcetx.referenceId;
          response.data.validTill = sourcetx.referenceId;
          response.data.expiryMinutes = sourcetx.referenceId;
          response.data.authDetails = [
            {
              "type": "otp",
              "label": "6-digit OTP",
              "Message": "Kindly enter the OTP sent to " + source_phone +" to complete the transaction"
            },
            {
              "type": "password",
              "label": "internet banking password",
              "Message": "Kindly enter your internet banking password"
            }
          ];
        d.resolve(response);

    })
    .catch( e => {
        
        ErrorLogger(e);
        if(e.message === 'Validation error') {
            e.message = 'The referenceId provided is not unique';
        }
        response.data.error = e.message;
        response.status = "failed"
        e.response = response;
        d.reject(e);

    })

    return d.promise;

}



service.morxspc = spec;
module.exports = service;

/*require('mlar')('service_tester')(service, {
    business_name:'Green Berg Inc',
    business_type:'e-commerce',
    email:Date.now()+"@kkk.com",
    password:'12345',
    meta:{collegue:124, debo:3940},
    country:'12345',
    public_key:'12345',
    secret_key:'12345',
    test_public_key:'12345',
    test_secret_key:'12345',
    contact_person:Date.now()+" Alaw",
}, false);*/
