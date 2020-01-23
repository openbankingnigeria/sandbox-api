const Log = require('mlar').mreq('mongo_models','log');
const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');  
var morx = require('morx'); 
var q = require('q');

var spec = morx.spec({})  
                .build('id', 'required:true')
                .build('apiuser', 'required:true')
                .end(); 


function service(data) {

    let d = q.defer();
    let params = {};

    q
    .fcall( () => {

        let result = morx.validate(data, spec, {throw_error:true});
        params = result.params;
        //console.log(params);
        //Doing a reqlog lookup first is to ensure devs can't pass someone else's request id
        return models.reqlog.findOne({where: {requestId: params.id, apiuserId: params.apiuser}, raw: true})
    })
    .then( reqlog_entry => {
      if(!reqlog_entry) throw new Error("No request log found");
      params.reqlog = reqlog_entry;
      return Log.find({type:'api_call', log_id: params.id}, null, {lean: true});
    })
    .then( logs => {

        d.resolve({logs, reqlog: params.reqlog});
    })
    .catch( e => {
        
        ErrorLogger(e, params.requestId);
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
