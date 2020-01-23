const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const sanitizers = require('mlar')('sanitizers');
var normalize = require('./normalize');
const paginate = require('mlar')('paginate')


var spec = morx.spec({})  
                .build('bankId', 'required:true')
                .build('id', 'required:false')
                .build('branchId', 'required:false')
                .build('merchantId', 'required:false')
                .build('latitude', 'required:false')
                .build('longitude', 'required:false')
                .build('fetch_one', 'required:false') 
                .build('return_branch_id', 'required:false') 
                .end(); 

function padWithLeadingZero(string, requiredLength) {
    if (string.length <requiredLength) {
        return "0" + string;        
    }
}

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

        if (params.id) { query_where.id = params.id }
        if (params.branchId) { query_where.branchId = params.branchId }
        if (params.merchantId) { query_where.merchantId = params.merchantId }
        if (params.latitude) { query_where.latitude = params.latitude }
        if (params.longitude) { query_where.longitude = params.longitude }
        if (params.radius) { query_where.radius = params.radius }

        return [models.terminal.findAndCountAll({
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
    .spread( (terminals, params) => {
        if (!terminals.rows.length) throw new Error("No entity with the specified id")

        let response = terminals.rows.map(normalize)

        if (params.fetch_one) {
            response = response[0];
            if (!response) throw new Error("POS not found");
            
            response = {
                terminalId: response.terminalId,
                merchantId: response.merchantId,
                merchantName: response.merchantName,
                email: response.email,
                phone: response.phone,
                dateDeployed: sanitizers.hyphenatedDate(response.dateDeployed),
                currency: response.currency,
                terminalType: response.terminalType,
                ptsa: response.ptsa,
                ptsp: response.ptsp,
                status: response.status,
                location: response.location
            }

            d.resolve(response);
        }


        let finalResponse = [];
    
        response.forEach(response=> {
            let responseObj = {
                terminalId: response.terminalId,
                merchantId: response.merchantId,
                merchantName: response.merchantName,
                email: response.email,
                phone: response.phone,
                dateDeployed: sanitizers.hyphenatedDate(response.dateDeployed),
                currency: response.currency,
                terminalType: response.terminalType,
                ptsa: response.ptsa,
                ptsp: response.ptsp,
                status: response.status,
                location: response.location
            }

            finalResponse.push(responseObj);
        })
        d.resolve(paginate(finalResponse, 'pos', terminals.count, limit, page));
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
