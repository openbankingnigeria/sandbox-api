const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const md5hash = require('crypto');
const validator = require('mlar')('validators');
const assert = require('mlar')('assertions');
const debitService = require('mlar').mreq('services', 'directdebit/debit');


var spec = morx.spec({})  
                .build('amount', 'required:true')
                .end(); 


function service(payload, urlParams) {

    var d = q.defer();

    q
    .fcall( async () => {   
        const result = morx.validate(payload, spec, {throw_error: true});
        const params = result.params;
        
        // amount must be digits only
        assert.digitsOnly(params.amount, null, 'Amount');
        const amountToDebit = params.amount;

        const selection = {
            where: {
                mandateID: urlParams.mandateId,
            }
        }
        
        return [amountToDebit, models.directdebit.findOne(selection)];
    })
    .spread( (amountToDebit, directdebit) => {

        if (!directdebit) throw new Error("Could not find direct debit record");
        if (directdebit.mandateStatus == 'cancelled') throw new Error("Cannot pay a cancelled direct debit");
        // get account query
        const accountSelectionCondition = {
            where: {
                accountNumber: directdebit.sourceAccount,
            }
        }

        return [directdebit, amountToDebit, models.account.findOne(accountSelectionCondition)]
    })
    .spread( (directdebit, amountToDebit, accountToDebit) => {
        if (!accountToDebit) throw new Error ("Could not fetch the account needed for this transaction");
        
        return [directdebit, debitService.debit(amountToDebit).from(accountToDebit)];
    })
    .spread( (directdebit, txDetails) => {
        if (!txDetails) throw new Error("An error occured while attempting to debit source account");
        
        let response = {};
        response.data = {};
        response.data.amountDebited = txDetails.amountDebited;
        response.data.mandate_status = directdebit.mandateStatus;
        response.data.next_possible_charge_date = directdebit.nextPossibleChargeDate;
        response.data.transactionRef = directdebit.transactionRef;
        response.data.statusWebHook = directdebit.statusWebHook;
    
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
