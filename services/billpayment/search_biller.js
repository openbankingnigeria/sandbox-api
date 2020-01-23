const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
var normalize = require('./normalize_biller');


var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('id', 'required:false')
                .build('fetch_one', 'required:false')
                .end(); 



function service(data) {

    var d = q.defer();

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
        return [models.biller.findAll({
            raw: true,
            where: query_where,
            attributes: {
                exclude: DEFAULT_EXCLUDES
            },
            order: [['createdAt', 'ASC']]
        }), params]
    })
    .spread( (billers, params) => {

        let response = billers;
        
        if (params.fetch_one) {
            response = response[0];
            //response.billerId = response.id;
            
            response = {
                categoryId: response.categoryId,
                billerCategory: response.billerCategory,
                categoryDescription: response.categoryDescription,
                billerId: response.id,
                nameOfBiller: response.nameOfBiller,
                customerId: response.customerId,
                currency: "NAIRA"
            }
            if (!response) throw new Error("Type not found");
        }
        d.resolve(response);
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
