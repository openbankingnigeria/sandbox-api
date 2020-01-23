const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var morx = require('morx'); 
var q = require('q'); 

function service(data) {

    var d = q.defer();

    q
    .fcall( () => {

        return models.fraud_categories.findAll();        
        
    })
    .then( categories => {
        let response = [];

        categories.forEach(category=> {
            let object = {};
            object.code = category.code;
            object.name = category.name;
            object.expansionFields = [
                {
                    "id": "Some random ID",
                    "description": "Some random text",
                    "type": "Some random type",
                    "value": "Some value"
                  }
            ]
            response.push(object);
        })

        d.resolve(response);
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
}, false);*/
