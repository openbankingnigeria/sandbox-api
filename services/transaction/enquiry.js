const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const get_account = require('mlar').mreq('services', 'account/search');
const update_balance = require('mlar').mreq('services', 'account/balanceupdate');
const md5hash = require('crypto');
const cache = require('mlar').mreq('services', 'cache/get');

var spec = morx.spec({})  
                .build('accountNumber', 'required:true')
                .end(); 

function service(data) {
    const d = q.defer();
    q.fcall(() => {
        const result = morx.validate(data, spec, {throw_error: true})
        const params = result.params
        const projection = { 
            where: 
                { 
                    accountNumber: params.accountNumber 
                }
        };

        return [params, models.account.findOne(projection)];
        
    }).spread( (params, account) => {
        if (!account) throw new Error(`Could not find customer with the account number: ${params.accountNumber}` );
        
        d.resolve({
            data: {accountNumber: account.accountNumber,
                    accountName: account.accountName,
                    bvn: account.bvn,
            },
        })       
    })
    .catch( (error) => {
        d.reject(error);
    })

    return d.promise;
}


service.morxspc = spec;
module.exports = service;