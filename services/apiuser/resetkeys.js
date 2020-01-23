const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const obval = require('mlar')('obval'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES; 
const rand = require('crypto').randomBytes;
const create_hash = require('crypto').createHash;
const createmagiclink = require('./createmagiclink');

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('id', 'required:true')
                .end(); 



function service(data) {

    var d = q.defer();
    let bankCode = null;
    let params = {};

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        params = result.params;

        return models.apiuser.findById(params.id);
        
    })
    .then(apiuser => { 
      if(!apiuser) throw new Error('Invalid API User');
      
      apiuser.apiKey =  'ak_' + rand(4).toString('hex');
      apiuser.apiSecret =  'as_' + rand(8).toString('hex');
      
      return apiuser.save();
    })
    .then(apiuser => {
      d.resolve(obval.select(['email','fullname']).from(apiuser));
    })
    .catch( e => {
        
        ErrorLogger(e);
        if(e.message === 'Validation error'){
            e.message = 'The email supplied already exists';
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
