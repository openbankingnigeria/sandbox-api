const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
var morx = require('morx'); 
let moment = require('moment');
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const sanitizers = require('mlar')('sanitizers');
const paginate = require('mlar')('paginate')


var spec = morx.spec({})  
                .build('from', 'required:false')
                .build('to', 'required:false')
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
        let query_where= {};
        if (params.from && params.to) {
            let start = (process.env.NODE_ENV == 'development')? moment(moment(params.from).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601) : moment(moment(params.from).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601).add(1, 'h');
            let stop = (process.env.NODE_ENV == 'development')? moment(moment(params.to).format('YYYY-MM-DD') + ' 23:59:59', moment.ISO_8601) : moment(moment(params.to).format('YYYY-MM-DD ') + '23:59:59', moment.ISO_8601).add(1, 'h');
            query_where.createdAt = { $gte: start.toISOString(), $lte: stop.toISOString() }

        }
        return [models.metrics.findAndCountAll({
            limit,
            offset,
            raw: true,
            where: query_where,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'bankId']
            },
            order: [['createdAt', 'DESC']]
        }), params]
    })
    .spread( (metrics, params) => {
        let response = metrics.rows.map(m=> {
            m.metricStartTime = moment(m.metricStartTime).format('YYYY-MM-DD HH:MM:ss')
            m.metricEndTime = moment(m.metricEndTime).format('YYYY-MM-DD HH:MM:ss')
            m.expansionFields = [
                {
                    "id": m.id,
                    "description": `Metric for ${m.function} function`,
                    "type": "Some random type",
                    "value": "Some value"
                }
            ]
            return m;
        })
        d.resolve(paginate(metrics.rows, 'metrics', metrics.count, limit, page));
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
