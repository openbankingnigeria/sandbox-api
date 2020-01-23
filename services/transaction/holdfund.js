const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
const sequelize = require('sequelize');
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var normalize = require('./normalize');
const assert = require('mlar')('assertions');
const currencies = require('mlar')('currencies');
const moment = require('moment');


var spec = morx.spec({})  
                .build('referenceId', 'required:true')
                .build('account', 'required:true')
                .build('amount', 'required:true')
                .build('currency', 'required:true')
                .build('startHoldDate', 'required:true')
                .build('endHoldDate', 'required:true')
                .end();


function service(data) {

    var d = q.defer();

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;

        assert.nubanFormatOnly(params.account);
        assert.digitsOnly(params.amount, null, 'Amount');
        assert.dateFormatOnly(params.startHoldDate);
        assert.dateFormatOnly(params.endHoldDate);

        if (moment().isAfter(params.startHoldDate)) throw new Error("startHoldDate must be a time in the future");
        if (moment().isAfter(params.endHoldDate)) throw new Error("endHoldDate must be a time in the future");
        if (moment(params.startHoldDate).isAfter(params.endHoldDate)) throw new Error("startHoldDate cannot be after the endHoldDate");
        if (parseFloat (params.amount) < 0) throw new Error("Amount cannot be negative");
        if (parseFloat (params.amount) == 0) throw new Error("Amount cannot be equal to zero");

        let currency = params.currency.toUpperCase();
        if (!currencies[currency]) {
            throw new Error("Invalid currency passed");
        }
        params.transactionRef = params.referenceId;

        return [params, params.amount, models.account.findOne({where: {accountNumber: params.account}})];

    }).spread(async (params, amount, account) => {
        if (!account) throw new Error("Could not get the required account");
        let heldfundinstance = await models.heldfund.findOne({where: {referenceId: params.referenceId}});
        if (heldfundinstance && heldfundinstance.id) throw new Error("Duplicate reference ID")
        account.availableBalance = parseFloat(account.availableBalance);
        amount = parseFloat(amount);
        account.minimumBalance = parseFloat(account.minimumBalance);
    
        if (account.availableBalance - amount < account.minimumBalance)  throw new Error('Cannot go below the minimum balance');
        if (account.availableBalance - amount < 0) throw new Error("Cannot have a negative balance");

        // debit
        account.availableBalance -= amount;
        
        // increase the holdBalance
        account.holdBalance += amount;
        
        // run transaction
        return models.sequelize.transaction((t1) => {
            return q.all([account.save({transaction: t1}), models.heldfund.create(params, {transaction: t1})]);
        })

    })
    .spread((account, heldFund) => {
        if (!heldFund) throw new Error("An error occured while carrying out the operation");
        if (!account) throw new Error("An error occured while carrying out the operation");
        return heldFund
    })
    .then( heldFund => {
        let response = {}
        response.data = {};
        response.data.errors = null;
        response.data.error = null;
        response.data.transactionRef = heldFund.transactionRef;
        response.data.validTill = "20191220120312";
        response.data.authDetails = [
            {
                type: 'card',
                lagel: 'ss',
                message: 'Fund held',
            }
        ];
        response.data.expiryMinutes = 5999;     
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
