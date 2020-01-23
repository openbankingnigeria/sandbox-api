const Log = require('mlar').mreq('mongo_models','log');
const ErrorLogger = require('mlar')('errorlogger');  
var morx = require('morx'); 
var q = require('q');

var spec = morx.spec({})  
                .build('id', 'required:true')
                .build('comment', 'required:true')
                .build('type', 'required:true')
                .build('data', 'required:false')
                .end(); 


function service(data) {

    let d = q.defer();
    let params = {};

    q
    .fcall( () => {

        let result = morx.validate(data, spec, {throw_error:true});
        params = result.params;
        const ts = Date.now();
        const log = {
            log_id: params.id,
            comment: params.comment,
            type: params.type,
            data: params.data,
            ts: ts
        }

        return new Log(log).save()
    }) 
    .then( created_log => {
        d.resolve(1);
    })
    .catch( e => {
        
        ErrorLogger(e, params.requestId);
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
