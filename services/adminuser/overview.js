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
        
        const integrators = models.apiuser.findOne({
            where: {
                is_admin: 0
            },
            attributes: [
                [models.sequelize.fn('count', models.sequelize.col('id')), 'total'],
            ]
        });

        const users = models.apiuser.findOne({
            where: {
                is_admin: 1
            },
            // group: 'id',
            attributes: [
                [models.sequelize.fn('count', models.sequelize.col('id')), 'total'],
            ]
        });

        const transactions = models.transaction.findOne({
            where: {
                //ais_admin: 0
            },
            attributes: [
                [models.sequelize.fn('count', models.sequelize.col('id')), 'total'],
            ]
        });

        return [integrators, users, transactions];
        
    })
    .spread( (integrators, users, transactions) => {
        d.resolve({integrators, users, transactions});
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
