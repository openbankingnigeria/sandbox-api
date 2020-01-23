const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const md5hash = require('crypto');
const validator = require('mlar')('validators');
const assert = require('mlar')('assertions');
const sanitizers = require('mlar')('sanitizers');

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



function service(data) {

    var d = q.defer();

    q
    .fcall( async () => {
        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;

        assert.digitsOnly(params.referenceId);

        // check whether such direct debit already exists;
        let directdebit = await models.directdebit.findOne({
            where: {
                referenceId: params.referenceId
            }
        })
        if (directdebit) throw new Error('Direct debit with that reference id already exists');

        
        params.transactionRef = `TX-${new Date().getTime()}${md5hash.createHash('md5').update(params.referenceId).digest('hex')}`
        params.mandateID = `MD-${new Date().getTime()}${md5hash.createHash('md5').update(params.referenceId ).digest('hex')}`
        
        assert.nubanFormatOnly(params.sourceAccount, null, 'Source Account');
        assert.nubanFormatOnly(params.merchantAccount, null, 'Merchant Account');
        
        if (params.maximumAmount) assert.digitsOnly(params.maximumAmount, null, 'Maximum Amount');
        if (params.maximumTransaction) assert.digitsOnly(params.maximumTransaction, null, 'Maximum Transaction');
        
        return [params, models.directdebit.create(params)];
    })
    .spread( (params, directdebit) => {
        if (!directdebit) throw new Error("Could not create direct debit record");
        let response = {};
        response.data = {};
        response.data.mandateStatus =  "pending";
        response.data.mandateID =  directdebit.mandateID;
        response.data.transactionRef = directdebit.transactionRef;
        response.data.validTill = params.endDate ? params.endDate : sanitizers.hyphenatedDate(new Date(new Date().getFullYear() + 1, 9, 26)) ; //stub for now
        response.data.statusWebHook = 0; // stub
        response.data.expiryMinutes = 70000; // stub
        response.data.authDetails =[ 
            {
                type: 'otp',
                label: '6-digit OTP',
                Message: "Kindly enter the OTP sent to ****1412 to complete the transaction"
            },
            {
                type: 'password',
                label: 'internet banking password',
                Message: "Kindly enter your internet banking password"
            },
    ]
        

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
