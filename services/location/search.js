const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var morx = require('morx'); 
var q = require('q'); 
var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('entity', 'required:true')
                .build('entitytype', 'required:true')
                .build('fetch_one', 'required:false')
                .end(); 



function service(data) {

    var d = q.defer();
    let fetch_one = false;

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        fetch_one = params.fetch_one;
        const query_where = { 
            entity: params.entity,
            entitytype: params.entitytype
        }
        const model_method = 'findAll';
        return models.location[model_method]({
            raw: true,
            where: query_where,
            attributes: {
                exclude: [...DEFAULT_EXCLUDES, 'id', 'entity', 'entitytype']
            },
            order: [['createdAt', 'ASC']]
        })
    })
    .then( locations => {
        let normalized_locations = locations.map(normalize);
        if (fetch_one) {
            normalized_locations = normalized_locations[0];
        } 
        d.resolve(normalized_locations);
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
