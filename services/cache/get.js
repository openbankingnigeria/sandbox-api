const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
 

var spec = morx.spec({})
                .build('key', 'required:true')
                .build('parse_json', 'required:true') 
                .end(); 



function service(data) {

    var d = q.defer(); 
    let parse_json = null;

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        parse_json = params.parse_json;
        delete params.parse_json;

        return models.cache.findOne({raw: true, where:params});
    })
    .then(cache => {
        if(!cache) cache = {};
        if(parse_json && cache.cache) cache.cache = JSON.parse(cache.cache);
        d.resolve(cache.cache);
    })
    .catch( e => {
        
        d.reject(e);

    })

    return d.promise;

}



service.morxspc = spec;
module.exports = service; 