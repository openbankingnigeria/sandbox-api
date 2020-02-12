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

//var normalize = require('./normalize');

var spec = morx
  .spec({})
  .build('bankId', 'required:false')
  .build('email', 'required:true,validators:isEmail')
  .build('fullname', 'map:fullName, required:true')
  .build('phonenumber', 'map:phoneNumber, required:false')
  .build('company', 'required:true')
  .build('password', 'required:true')
  .end();

function service(data, is_admin) {
  var d = q.defer();
  let bankCode = null;

  q.fcall(() => {
    var result = morx.validate(data, spec, { throw_error: true });
    var params = result.params;
    params.apiKey = 'ak_' + rand(4).toString('hex');
    params.apiSecret = 'as_' + rand(8).toString('hex');
    params.passwordhash = create_hash('sha512')
      .update(params.password)
      .digest('hex');

    regexer(params.phoneNumber, /[^0-9-\s+]/, 'Invalid mobile number');
    regexer(params.fullName, /[^a-zA-Z0-9\s_\-\+\.]+/, 'Invalid full name');
    regexer(params.company, /[^a-zA-Z0-9\s_\-\+\.]+/, 'Invalid company name');
    //params.is_admin = is_admin;

    return models.apiuser.create(params);
  })
    .then(apiuser => {
      createmagiclink({ email: apiuser.email, type: 'welcomemail.html', subject: 'Welcome to the Open Banking Nigeria Sandbox' });
      d.resolve(obval.select(['email', 'fullname']).from(apiuser));
    })
    .catch(e => {
      ErrorLogger(e);
      if (e.message === 'Validation error') {
        e.message = 'The email supplied already exists';
      }
      d.reject(e);
    });

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
