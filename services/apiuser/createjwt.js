const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q');  
const create_hash = require('crypto').createHash;
const jwt = require('jsonwebtoken');
const obval = require('mlar')('obval'); 

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('magic_link_token', 'required:true')
                .end(); 



function service(data, is_admin) {

    var d = q.defer();
    let params = {};

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        params = result.params; 

        return models.magic_link_token.findOne({
          where: {
            token: params.magic_link_token,
            // expires: {
            //   $lte: Date.now()
            // }
          }
        })
        
    })
    .then(magic_link_token => {
      if(!magic_link_token) throw new Error('Invalid magic link token passed');
      if(magic_link_token.expires < Date.now()) throw new Error('Magic link has expired');
      params.magic_link_token = magic_link_token;
      return models.apiuser.findById(magic_link_token.apiuserId, {raw: true})
    })
    .then(apiuser => {
        if(!apiuser) throw new Error('API user not found');  
        const token = jwt.sign({id: apiuser.id}, process.env.JWTKEY, {expiresIn:`${(2.5)}h`});
        params.magic_link_token.expires = 0; //Once used make it expired;
        return [apiuser, token, params.magic_link_token.save()];
    })
    .spread( (apiuser, token) => { 

        const response = obval.exclude(['passwordhash', 'updatedAt', 'createdAt', 'deletedAt', 'id', 'api_key']).from(apiuser);
        response.token = token;
        d.resolve(response);

    })
    .catch( e => {
        
        ErrorLogger(e);
        if(~e.message.indexOf('isEmail')) {
            e.message = "Invalid email address supplied";
        }
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
