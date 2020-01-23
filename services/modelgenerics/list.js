const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q'); 
const el = require('./excludelist');

var spec = morx.spec({})  
                .build('model', 'required:true')
                .build('queryConfig', 'required:true') 
                .end(); 



function service(data) {

    var d = q.defer();

    q
    .fcall( () => {
        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        params.model = params.model.toLowerCase().trim();
        if(el[params.model]) throw new Error('Access Nah');
        return [params, models[params.model].findAll(params.queryConfig)];
    })
    .spread( (params, modelList) => {
        d.resolve(modelList);
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
}, true);*/
