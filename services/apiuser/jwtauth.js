const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q');   
const jwt = require('jsonwebtoken');  


var spec = morx.spec({})   
                .build('token', 'required:true')
                .end(); 



function service(data) {

    var d = q.defer();
    let params = {};

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        params = result.params; 

        return jwt.verify(params.token, process.env.JWTKEY)
        
    })
    .then(decoded_token => { 

        
        ErrorLogger(decoded_token);
        return [
            models.apiuser.findById(decoded_token.id, {raw: true, attribsutes:['id']})
        ];
    })
    .spread( (apiuser) => {
        if(!apiuser) throw new Error("Invalid api user")
        d.resolve(apiuser);

    })
    .catch( e => {
        
        ErrorLogger(e);
        if(e.message === 'Validation error'){
            e.message = 'The email supplied already exists';
        }
        if(e.message === 'jwt expired'){
            e.message = 'Token has expired, please re-verify';
        }
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
