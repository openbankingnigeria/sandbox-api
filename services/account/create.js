const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const normalize = require('./normalize');
const generate_nuban = require('mlar')('generate_nuban');
const create_customer = require('mlar').mreq('services', 'customer/create');
const set_default = require('mlar')('mt1l').set_default;
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');

var spec = morx.spec({})  
                .build('accountTypeId', 'required:true')
                .build('firstName', 'required:true')
                .build('otherName', 'required:true')
                .build('surname', 'map:lastName,required:true')
                .build('email', 'required:true')
                .build('dateOfBirth', 'required:true')
                .build('street', 'required:true')
                .build('state', 'required:true')
                .build('postalCode', 'required:true')
                .build('city', 'required:true')
                .build('addrLine1', 'required:false')
                .build('addrLine2', 'required:false')
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
    .fcall( async () => {
        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        assert.bvnFormatOnly(params.bvn, null, 'BVN')
        assert.digitsOnly(params.phone, null, 'Phone')
        assert.dateFormatOnly(params.dateOfBirth, null, 'Date of Birth')
        if (!validators.isEmail(params.email)) {
            throw new Error("Email is not in the appropriate format");
        }
        await models.customer.findOne({
            where: {
                email: params.email
            }
        }).then(resp=> {
            if (resp) throw new Error("Customer with email exists")
        })
        // make sure is valid email and phone number
        params.accountOpeningDate = new Date();
        params.status = "NEW";
        set_default(params, 'currency', 'NGN');
        set_default(params, 'decimal', '0.0');
        set_default(params, 'accountType', 'SAVINGS');
        params.availableBalance = 0;
        params.clearedBalance = 0;
        params.unclearedBalance = 0;
        params.holdBalance = 0;
        params.minimumBalance = 0;
        params.accountName = params.fullName = [params.firstName, params.otherName, params.lastName].join(' ');

        return [params, create_customer(params)];
    })
    .spread( (params, customer) => {
        if (!customer) throw new Error('An error occured while creating the customer');
        params.customerId = customer.id;
        return [params, models.account.create(params)];
    })
    .spread( (params, account) => {
        account.accountNumber = generate_nuban(account.id, params.appBankCode);
        return account.save();
    })
    .then( (account) => {

        d.resolve(normalize(account));

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
