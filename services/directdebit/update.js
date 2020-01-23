const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const md5hash = require('crypto');
const validator = require('mlar')('validators');
const assert = require('mlar')('assertions');

var spec = morx.spec({})  
                .build('referenceId', 'required:true')
                .build('description', 'required:true')
                .build('sourceAccount', 'required:true')
                .build('sourceAccountName', 'required:true')
                .build('maximumAmount', 'required:false')
                .build('maximumTransaction', 'required:false')
                .build('sourceCurrency', 'required:true')
                .build('startDate', 'required:true')
                .build('endDate', 'required:false')
                .build('merchantAccount', 'required:true')
                .build('merchantAccountName', 'required:true')
                .build('merchantCurrency', 'required:true')
                .build('statusWebHook', 'required:false')
                
                .end(); 



function service(data, urlParams) {

    var d = q.defer();

    q
    .fcall( async () => {
        // first validate url params 
        assert.nubanFormatOnly(urlParams.account, null, 'Account');

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        assert.digitsOnly(data.referenceId, null, 'Reference Id');

        assert.nubanFormatOnly(params.sourceAccount, null, 'Source Account');
        
        if (params.maximumAmount) 
            assert.digitsOnly(params.maximumAmount, null, 'Maximum Amount');
        
        if (params.maximumTransaction) 
            assert.digitsOnly(params.maximumTransaction, null, 'Maximum Transaction');        
        
        const selection = { 
            where: {
                sourceAccount: urlParams.account,
                mandateID: urlParams.mandateId,
            }
        }
        
        return [params, models.directdebit.findOne(selection)];
    })
    .spread( (params, directdebit) => {
        if (!directdebit) throw new Error("Could not find record");
        return directdebit.update({...params});
    }).then((directdebit) => {
        if (!directdebit) throw new Error("An error occured while updating record");
        let response = {};
        response.data = {};
        response.data.mandateStatus = directdebit.mandateStatus;
        response.data.nextPossibleChargeDate = new Date(); // stub
        response.data.mandateID = directdebit.mandateID; 
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
}, true);*/
