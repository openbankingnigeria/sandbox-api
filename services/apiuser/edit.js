const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const obval = require('mlar')('obval'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES; 
const rand = require('crypto').randomBytes;
const create_hash = require('crypto').createHash;
const createmagiclink = require('./createmagiclink');
const regexer = require('./regexer');
const validurl = require('valid-url');

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('id', 'required:true')
                .build('email', 'required:false,validators:isEmail')
                .build('fullName', 'map:fullName, required:false')
                .build('phoneNumber', 'map:phoneNumber, required:false')
                .build('company', 'required:false')
                .build('callback_url', 'required:false')
                .build('app_name', 'required:false')
                .end(); 



function service(data) {

    var d = q.defer();
    let bankCode = null;
    let params = {};

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        params = result.params;

        regexer(params.phoneNumber, /[^0-9-\s+]/, 'Invalid mobile number');
        regexer(params.fullName, /[^a-zA-Z0-9\s_\-\+\.]+/, 'Invalid full name');
        regexer(params.app_name, /[^a-zA-Z0-9\s_\-\+\.]+/, 'Invalid app name');
        regexer(params.company, /[^a-zA-Z0-9\s_\-\+\.]+/, 'Invalid company name');
        if(params.callback_url) {
          params.callback_url = params.callback_url.trim();
        }
        if(params.callback_url && !validurl.isWebUri(params.callback_url)){
          throw new Error('Invalud callback URL');
        }

        return models.apiuser.findById(params.id);
        
    })
    .then(apiuser => { 
      if(!apiuser) throw new Error('Invalid API User');
      if(params.company) {
        apiuser.company = params.company;
      }
      if(params.phoneNumber) {
        apiuser.phoneNumber = params.phoneNumber;
      }
      if(params.fullName) {
        apiuser.fullName = params.fullName;
      }
      if(params.email) {
        apiuser.email = params.email;
      }
      if(params.callback_url) {
        apiuser.callback_url = params.callback_url;
      }
      if(params.app_name) {
        apiuser.app_name = params.app_name;
      }

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
