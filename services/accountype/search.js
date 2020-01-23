const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var normalize = require('./normalize');

const paginate = require('mlar')('paginate')

var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('id', 'required:false')
                .build('fetch_one', 'required:false')
                .end(); 



function service(data) {

    var d = q.defer();
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? Number(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        const query_where = {
            bankId: params.bankId
        };

        if (params.id) {
            
            query_where.id = params.id
        }
        return [models.accountype.findAndCountAll({
            raw: true,
            limit, 
            offset,
            where: query_where,
            attributes: {
                exclude: DEFAULT_EXCLUDES
            },
            order: [['createdAt', 'ASC']]
        }), params]
    })
    .spread( (types, params) => {

        let response = types.rows.map(normalize)
        
        if (params.fetch_one) {
            response = response[0];
            if (!response) throw new Error("Type not found");
            d.resolve(response)
        }
        response.map(r=> {
            r.expansionFields = [
                {
                  "id": "Some random ID",
                  "description": "Some random text",
                  "type": "Some random type",
                  "value": "Some value"
                }
            ]
            
        })
        d.resolve(paginate(response, 'types', types.count, limit, page));
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
