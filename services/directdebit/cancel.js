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
        const selection = {
            where: {
                mandateID: urlParams.mandateId,
            }
        }
        
        return models.directdebit.findOne(selection);
    })
    .then( (directdebit) => {

        if (!directdebit) throw new Error("Could not find record");
        directdebit.mandateStatus = 'cancelled';
        return directdebit.save();
    })
    .then( (directdebit) => {
        if (!directdebit) throw new Error ("An error occured while cancelling direct debit ");
        
        let response = {};
        response.mandate_status = directdebit.mandateStatus;
        response.referenceId = directdebit.referenceId; 
        response.next_possible_charge_date = directdebit.nextPossibleChargeDate;
        response.statusWebHook = directdebit.statusWebHook || "https://merchantfeedback.merchant.com/status/ABCD12345678901234567890/";
        response.expansionFields = [{
                "id": "Some random ID",
                "description": "Some random text",
                "type": "Some random type",
                "value": "Some value"
            }
        ]

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
}, true);*/
