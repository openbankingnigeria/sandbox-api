const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;


var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('id', 'required:true')
                .end(); 



function service(data) {

    var d = q.defer();

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        return models.apiuser.findOne( {
            raw: true,
            where: {
                id: params.id
            }
        })
        
    }).then( apiuser => {
        if(!apiuser) throw new Error('API USER NOT FOUND');
        console.log(`${apiuser.apiKey}:${apiuser.apiSecret}`);
        d.resolve({
            authorizationCode: Buffer.from(`${apiuser.apiKey}:${apiuser.apiSecret}`).toString('base64')
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
