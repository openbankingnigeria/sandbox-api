const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var normalize = require('./normalize_item');
const paginate = require('mlar')('paginate')


var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('billerId', 'required:true')
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
        if (params.billerId) {
            query_where.billerId = params.billerId;
        }

        return [models.billitem.findAndCountAll({
            limit, 
            offset,
            raw: true,
            where: query_where,
            attributes: {
                exclude: DEFAULT_EXCLUDES
            },
            order: [['createdAt', 'ASC']]
        }), params]
    })
    .spread( (billitems, params) => {

        let response = billitems.rows.map(normalize);
        
        if (params.fetch_one) {
            response = response[0];
            if (!response) throw new Error("Type not found");
            d.resolve(response)
        }
        d.resolve(paginate(response, 'items', billitems.count, limit, page));
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
