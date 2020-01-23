const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const get_account = require('mlar').mreq('services', 'account/search');
const update_balance = require('mlar').mreq('services', 'account/balanceupdate');
const md5hash = require('crypto');
const cache = require('mlar').mreq('services', 'cache/get');
const assert = require('mlar')('assertions');

//var normalize = require('./normalize');


/**
 * 
 * requestRef	number	Required A unique request reference
transactionRef	number	Required A unique transaction reference
authDetails		
type	string	Required The type of authorization method e.g OTP password
value	string	Required The authorization value
{
    "transactionRef": "5000",
    "requestRef": "5000",
    "authDetails": [{
        "type": "OTP",
        "value": "12344"
    }, {
        "type": "password",
        "value": "12344"
    }],
}
 */

var spec = morx.spec({})  
                .build('bankId', 'required:true') 
                .build('transactionRef', 'required:true')
                .build('requestRef', 'required:true')
                .build('authDetails', 'required:true')
                .end(); 



function service(data) {

    var d = q.defer();

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        if(params.authDetails.forEach) {
            params.authDetails.forEach(ad => {
                params[ad.type] = ad.value;
            });
            if(!params.OTP) throw new Error('No OTP supplied');
            if(!params.password) throw new Error('No passworrd supplied');
        } else {
            throw new Error('authDetails should be an array')
        }
        const sourcetx = models.transaction.findOne({
            where: {
                referenceId: params.transactionRef
            }
        });

        console.log("searching " + params.transactionRef +''+ params.bankId,)
        const cached = cache({
            key: params.transactionRef +''+ params.bankId,
            parse_json: true
        })
        return [params, sourcetx, cached];
    })
    .spread((params, sourcetx, cached) => {
        if(!cached) throw new Error('Invalid transaction ref supplied');
        if(!sourcetx) throw new Error('Invalid transaction ref supplied');
        //if(sourcetx.status !== 'PENDING-AUTH') throw new Error('Transaction can no longer be completed. Status not pending');
        //if(parseInt(params.OTP) !== parseInt(cached.cache.OTP)) throw new Error('Invalid OTP supplied');
        let OTP =  params.OTP ? params.OTP.toString() : null;
        assert.digitsOnly(OTP, null, "OTP");

        if (OTP && (OTP.length !== 6 || OTP.indexOf("200") < 0)) throw new Error("To be valid, OTP should be 6 digits and contain `200`");

        if(params.password !== '123456') throw new Error('Invalid banking password passed');

        const sourcedebit =  update_balance({
            id: sourcetx.accountId,
            value: sourcetx.amount,
            type: 'debit'
        });

        return q.allSettled([sourcetx, sourcedebit, cached])

    })
    .spread( (sourcetx_, sourcedebit_, cached_) => {

        const sourcetx = sourcetx_.value;
        const sourcedebit = sourcedebit_.value;
        const cached = cached_.value;
        sourcetx.status = "SUCCESSFUL";
        sourcetx.statusCode = "00";
        let desttx, destinationcredit;

        if(!sourcedebit) {
            sourcetx.status = "FAILED";
            sourcetx.statusCode = "RR01"; //Insufficiend funds
        }else {
            cached.destinationtx.status = "SUCCESSFUL";
            cached.destinationtx.statusCode = "00";
            cached.destinationtx.valueDate = new Date();
            sourcetx.valueDate = new Date();
            desttx = models.transaction.create(cached.destinationtx);
            destinationcredit = update_balance({
                       id: cached.destinationtx.accountId,
                       value: cached.destinationtx.amount,
                       type: 'credit'
                   })
        }

        return [sourcetx.save(), desttx, destinationcredit]

    })
    .spread( (sourcetx, desttx, credit) => {
        d.resolve({
            status: sourcetx.status,
            statusCode: sourcetx.statusCode,
        })
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
}, false);*/
