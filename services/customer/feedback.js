const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validator = require('mlar')('validators');
const assert = require('mlar')('assertions');
var spec = morx.spec({})  
                .build('feedbackReference', 'required:false')
                .build('customerID', 'required:false')
                .build('accountNumber', 'required:false')
                .build('bvn', 'required:false')
                .build('phoneNumber', 'required:false')
                .build('email', 'required:false', 'validators:email')
                .build('feedbackCategory', 'required:true')
                .build('feedbackDescription', 'required:true')
                .end(); 



function service(data) {

    var d = q.defer();
    var feedbackReference = {};
    q
    .fcall(async () => {
        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        feedbackReference = params.feedbackReference;
        
        if (params.accountNumber) 
            assert.nubanFormatOnly(params.accountNumber, null, 'Account Number');
        
        if (params.bvn) 
            assert.bvnFormatOnly(params.bvn);

        await models.customerfeedback.findOne({where: {feedbackReference: params.feedbackReference}})
            .then(resp=> {
                if (resp && resp.id) {
                    throw new Error("Feedback with the feedback reference already exists");
                }
            })
        return [params, models.customerfeedback.create(params)];
    })
    .spread( (params, feedback) => {
        if (!feedback) throw new Error("Could not create feedback")
        
        // return feedbackReference as specified by api requirement
        d.resolve({
            reportingReference: 'R' + params.feedbackReference,
            expansionFields: [
                {
                    "id": "Some random ID",
                    "description": "Some random text",
                    "type": "Some random type",
                    "value": "Some value"
                }
            ]
        });

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
