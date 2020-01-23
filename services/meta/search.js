const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
// const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var morx = require('morx'); 
var q = require('q'); 
//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('entity', 'required:true')
                .build('group', 'required:false') 
                .end(); 



function service(data) {

    var d = q.defer();

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        const query_where = {
            bankId: params.bankId,
            entity: params.entity
        }
        if (params.group) {
            query_where.group = {
                $in: params.group
            }
        }
        return models.meta.findAll({
            raw: true,
            where: query_where,
            attributes: ['name', 'description', 'value', ['entitytype', 'type'], 'group'],
            order: [['createdAt', 'ASC']]
        })
    })
    .then( meta => {
        d.resolve(meta);
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
