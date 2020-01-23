const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var normalize = require('./normalize');
const assert = require('mlar')('assertions');
const moment = require('moment');
const currencies = require('mlar')('currencies');


var spec = morx.spec({})  
                .build('referenceId', 'required:true')
                .build('accountNumber', 'required:true')
                .build('amount', 'required:true')
                .build('currency', 'required:true')
                .build('releaseHoldDate', 'required:true')
                //.build('transactionDate', 'required:true')
                .end(); 



function service(data) {
    const d = q.defer();

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;


        assert.nubanFormatOnly(params.accountNumber);
        assert.digitsOnly(params.amount, null, 'Amount');
        assert.dateFormatOnly(params.releaseHoldDate, null, "releaseHoldDate");

        if (moment().isAfter(params.releaseHoldDate)) throw new Error("releaseHoldDate must be a time in the future");
        if (parseFloat (params.amount) < 0) throw new Error("Amount cannot be negative");
        if (parseFloat (params.amount) === 0) throw new Error("Amount cannot be equal to zero");

        let currency = params.currency.toUpperCase();
        if (!currencies[currency]) {
            throw new Error("Invalid currency passed");
        }

        params.transactionRef = params.referenceId;
        
        return [params, params.amount, models.account.findOne({where: {accountNumber: params.accountNumber}})];
    }).spread( ( params, amount, account) => {
        if (!account) throw new Error("Could not get the required account");
        
        return [params, amount, account, models.heldfund.findOne({where: {referenceId: params.referenceId}})];

    }).spread( (params, amount, account, heldfund) => {
        if (!heldfund) throw new Error("Could not find appropriate records for the reference");
        
        heldfund.amount = parseFloat(heldfund.amount);

        if (!heldfund.amount) throw new Error("No funds held for this transaction");
        if (heldfund.amount - amount < 0) throw new Error("Cannot release more than was held");

        account.holdBalance = parseFloat(account.holdBalance);
        amount = parseFloat(amount);
        account.minimumBalance = parseFloat(account.minimumBalance);

        // account balance cannot be less than 0, but just for some sanity...
        if (account.holdBalance == 0 || account.holdBalance < 0) throw new Error("Not enough fund for release");
        if (account.holdBalance - amount  < account.minimumBalance) throw new Error("Cannot release more than available");
        
        // debit hold balance and credit available balance
        account.holdBalance -= amount;
        account.availableBalance += amount;
        
        // carry out action on corresponding heldfund record
        heldfund.amount -= amount;
        heldfund.releaseHoldDate = params.releaseHoldDate;
        
        return models.sequelize.transaction(t1 => {
            return q.all([account.save(), heldfund.save()]);
        }) 
    })
    .spread( (updatedAccount, updatedTransaction) => {
        if (!updatedTransaction) throw new Error("An error occured while carrying out the operation");
        if (!updatedAccount) throw new Error("An error occured while carrying out the operation");
        
        return [updatedAccount, updatedTransaction];
    })
    .spread( (updatedAccount, tx) => {
        let response = {}
        response = {};
        response.errors = null,
        response.error = null,
        response.transactionRef = tx.transactionRef;        
        d.resolve(response);

    })
    .catch( e => {
        
        ErrorLogger(e);
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
