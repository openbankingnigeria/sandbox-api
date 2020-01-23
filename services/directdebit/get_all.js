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

        return models.directdebit.findAll();
    })
    .then( (directdebit) => {


        d.resolve(directdebit);
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
