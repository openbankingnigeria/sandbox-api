const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const obval = require('mlar')('obval'); 
var morx = require('morx'); 
var q = require('q');
const paginate = require('mlar')('paginate');

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('apiuser', 'required:false')
                .build('page', 'required:false')
                .end(); 



function service(data) {

    var d = q.defer();
    let bankCode = null;
    const LIMIT = 20;
    let params = {};

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        params = result.params; 
        params.page = params.page || 1;
        params.offset = (params.page - 1) * LIMIT;
        const where = { };
        if(params.apiuser) {
            where.apiuserId = params.apiuser;
        }
        const logs = models.reqlog.findAndCountAll({raw: true, order: [['createdAt', 'DESC']], where:where, limit: LIMIT, offset: params.offset})
        const user = models.apiuser.findById(params.apiuser, {raw: false, include: [
            {
              model: models.reqlog,
              attributes: [
                [models.sequelize.fn('count', models.sequelize.col('requestId')), 'total'],
                [models.sequelize.fn('max', models.sequelize.col('reqlogs.createdAt')), 'lastcall'],
              ]
            }
          ], attributes: ['email', 'id', 'fullName', 'status', 'email', 'company', 'phonenumber', ['updatedAt', 'lastlogin']]});

          return [logs, user];
        
    })
    .spread((logs, user) => {
      //logs.rows = logs.rows.map(v=>obval.exclude(['id', 'updatedAt', 'deletedAt', 'apiuserId']).from(v));
      //const response = paginate(logs.rows, 'requestlogs', logs.count, LIMIT, params.page);
      d.resolve({user, logs});
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
