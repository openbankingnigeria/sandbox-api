const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q');  
const sendmail = require('./sendmail');
const mustache = require('mustache');

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('email', 'required:true')
                .build('subject', 'required:false')
                .build('type', 'required:false')
                .end(); 



function service(data, is_admin) {

    var d = q.defer();
    let params = {};

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        params = result.params;
        params.type = params.type || 'loginmail.html';

      return models.apiuser.findOne({where:{email: params.email}, raw: true})
    })
    .then(apiuser => {
        if(!apiuser) throw new Error('API user not found');  
        if(is_admin && !apiuser.is_admin) {
          throw new Error('no_admin');
        }
        params.apiuser = apiuser;
        const token = require('crypto').randomBytes(16).toString('hex');
        return models.magic_link_token.create({
          apiuserId: apiuser.id,
          email: params.email,
          token,
          expires: Date.now() + (30 * 60 * 1000)
        })
    })
    .then( (token) => {

        const LINK_BASE_URL = is_admin ? process.env.ADMIN_BASE_URL : process.env.BASE_URL;
        params.apiuser.accesslink = `${LINK_BASE_URL}magiclink/${token.token}/verify`;
        var email = mustache.render(require('fs').readFileSync(require('path').join(__dirname, params.type), {encoding:'utf8'}), params.apiuser);
        sendmail({
            email: params.apiuser.email,
            subject: params.subject,
            text: 'OPEN BANKING NIGERIA'
,           html: email
        })
        d.resolve(1);
    })
    .catch( e => {
        
        ErrorLogger(e);
        if(~e.message.indexOf('isEmail')) {
            e.message = "Invalid email address supplied";
        }
        if(e.message === 'Validation error'){
            e.message = 'The email supplied already exists';
        }

        if(e.message === 'no_admin') {
          e.message = 'Only admin accounts can access this platform';
          d.reject(e);
        } else {
          d.resolve(1); 
        }

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
