const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var normalize = require('./normalize');
const assert = require('mlar')('assertions');


function service(params) {

    var d = q.defer();

    q
    .fcall( () => {
        assert.nubanFormatOnly(params.accountNumber, null, 'Account Number');
        const selection = {
            where: {
                account: params.accountNumber,
                referenceId: params.referenceId
            },
            attributes: [
                'referenceId',
                'account', 
                'amount', 
                'currency',
                'narration',
                'startHoldDate',
                'endHoldDate',
                'transactionDate',
            ]
        }
        return models.heldfund.findOne(selection);

    }).then(heldfund => {
        if (!heldfund) throw new Error("Could not find record");
        let response = { 
            data: {},
        };

        response.data = heldfund;
        d.resolve(response)
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
