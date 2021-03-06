const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const obval = require('mlar')('obval'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES; 
const rand = require('crypto').randomBytes;
const create_hash = require('crypto').createHash;

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('bankId', 'required:false') 
                .end(); 



function service(data, is_admin) {

    var d = q.defer();
    let bankCode = null;

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        const is_admin_val = is_admin ? 1 : 0;
        const query = `select a.id, a.email, a.fullName, a.status, a.phonenumber, a.updatedAt as lastLogin, count(r.id) as total, max(r.createdAt) as lastcall FROM 
        apiuser as a left outer join reqlog as r ON a.id = r.apiuserId WHERE a.is_admin = ? GROUP BY a.id LIMIT 0, 10`;
         
      const integrators = models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT, replacements:[is_admin_val]}) 

      return integrators;
        
    })
    .then( (integrators) => {
        d.resolve(integrators);
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
