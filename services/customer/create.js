const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const normalize = require('./normalize');
const generate_nuban = require('mlar')('generate_nuban');
const create_customer = require('mlar').mreq('services', 'customer/create');
const set_default = require('mlar')('mt1l').set_default;

var spec = morx.spec({})  
                .build('accountTypeId', 'required:true')
                .build('firstName', 'required:true')
                .build('otherName', 'required:true')
                .build('lastName', 'map:lastName,required:true')
                .build('email', 'required:true')
                .build('dateOfBirth', 'required:true')
                .build('street', 'required:true')
                .build('state', 'required:true')
                .build('postalCode', 'required:true')
                .build('city', 'required:true')
                .build('addrLine1', 'required:true')
                .build('addrLine2', 'required:true')
                .build('bvn', 'required:true')
                .build('localGovernment', 'required:true')
                .build('country', 'required:true')
                .build('nationality', 'required:true')
                .build('requestId', 'required:true')
                .build('phone', 'required:true')
                .build('salutation', 'required:true')
                .build('bankId', 'required:true')
                .build('appBankCode', 'required:true')
                .end(); 



function service(data) {

    var d = q.defer();

    q
    .fcall( () => {
        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        // params.accountOpeningDate = new Date();
        // params.status = "NEW";
        // set_default(params, '');
        return [params, models.customer.create(params)];
    })
    .spread( (params, customer) => {

        const normalized = normalize(customer);
        normalized.id = customer.id;
        d.resolve(normalized);

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
