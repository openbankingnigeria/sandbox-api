const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q');
const validator = require('mlar')('validators');

const assert = require('mlar')('assertions');


var spec = morx.spec({})
                .build('reportingReference', 'required:false')
               // .build('cache', 'required:true')
                .build('customerID', 'required:false')
                .build('key', 'required:false')
                .build('cache', 'required:false')
                .build('accountNumber', 'required:false')
                .build('bvn', 'required:false')
                .build('phoneNumber', 'required:false')
                .build('email', 'required:false')
                .build('fraudCategory', 'required:false')
                .build('fraudDescription', 'required:false')
                .build('stringify_json', 'required:false')
                .end();



function service(data) {

    var d = q.defer(); 

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;

        if (params.accountNumber) {
            assert.nubanFormatOnly(params.accountNumber, null, 'Account Number');
        }

        if (params.bvn) {
            assert.bvnFormatOnly(params.bvn, null, 'BVN');
        }

        if (params.email) {
            assert.emailFormatOnly(params.email, null);
        }


        if (params.phoneNumber) {
            assert.digitsOnly(params.phoneNumber, null, "Phone number");

            if (!validator.isOfLength(params.phoneNumber, 11)) {
                throw new Error("Phone should be in this format: `08101234567`")
            }
            if (typeof params.phoneNumber == "number") {
                throw new Error("Phone number should be a string")
            }
        }


        if(params.stringify_json){
            delete params.stringify_json;

            params.cache = JSON.stringify({...params});
            
        }
        if (params.reportingReference) {
            params.key = params.reportingReference;
        }
        return [ models.cache.create(params), params];
    })
    .spread( (cache, params) => {
        let response = {};
        response.reportingReference = cache.key;
        response.expansionFields = [];

        let expansionObjects = {
            id: cache.id,
            description: `${params.fraudDescription}`,
            type: `Fraud report for ${params.fraudCategory}`,
            value: "Some value"
        }

        response.expansionFields.push(expansionObjects);
        
        d.resolve(response);
    })
    .catch( e => {

        d.reject(e);

    })

    return d.promise;

}



service.morxspc = spec;
module.exports = service; 