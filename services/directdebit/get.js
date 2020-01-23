const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const md5hash = require('crypto');
const validator = require('mlar')('validators');
const assert = require('mlar')('assertions');




function service(urlParams) {

    var d = q.defer();

    q
    .fcall( () => {
        // first validate url params 
        assert.nubanFormatOnly(urlParams.account, null, 'Account');
        
        const selection = {
            where: {
                sourceAccount: urlParams.account,
               mandateID: urlParams.mandateId,
            }
        }
        
        return models.directdebit.findOne(selection);
    })
    .then( (directdebit) => {

        if (!directdebit) throw new Error("No such direct debit exists");
        let response = {};
        response.data = {};
        response.data.mandate_status = directdebit.mandateStatus;
        response.data.referenceId = directdebit.referenceId; // stub
        response.data.mandateId = directdebit.mandateID; 
        response.data.description = directdebit.description; 
        response.data.sourceAccount = directdebit.sourceAccount;
        response.data.maximumAmount = directdebit.maximumAmount;
        response.data.maximumTransaction = directdebit.maximumTransaction;
        response.data.sourceCurrency = directdebit.sourceCurrency;
        response.data.sourceNarration = directdebit.sourceNarration;
        response.data.next_possible_charge_date = directdebit.nextPossibleChargeDate;
        response.data.startDate = directdebit.startDate;
        response.data.endDate = directdebit.endDate;
        response.data.frequency = directdebit.frequency;
        response.data.merchantCurrency = directdebit.merchantCurrency;
        response.data.merchantAccount = directdebit.merchantAccount;
        response.data.merchantAccountName = directdebit.merchantAccountName;
        response.data.statusWebHook = directdebit.statusWebHook;
        response.data.transactionRef = directdebit.transactionRef; 
        response.data.validTill = 70000;
        response.data.expiryMinutes = 9;
        response.data.statusWebHook = '0';
        response.data.authDetails = [
            {
                type: 'otp',
                label: '6-digit OTP',
                message: 'Kindly enter the OTP',
            }
        ];

        d.resolve(response.data);
    })
    .catch( e => {

        ErrorLogger(e);  
        d.reject(e);

    })

    return d.promise;

}

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
}, true);*/
