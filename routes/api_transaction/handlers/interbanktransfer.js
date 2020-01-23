var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'transaction/new');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params, context: 'inter'};
        // service_data.fetch_one = 1;
        service(service_data)
        .then( service_response => {
            utils.json(res, service_response.data, "The process was completed successfully", service_response.status, 200); 
        })
        .catch( service_error => {
            utils.json(res, service_error.response.data, service_error.response.message, service_error.response.status, 400); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/singleInterbankTransfer"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('transaction_interbank_transfer', 'dev')];
module.exports = vinfo;



/*
== MULTI METHOD / CONFIG ==
vinfo.routeConfig = [{}, {}];
vinfo.routeConfig[0].path = "/v12"; 
vinfo.routeConfig[0].method = "post"; 
vinfo.routeConfig[0].middlewares = ['v1'];
vinfo.routeConfig[1].path = "/v12"; 
vinfo.routeConfig[1].method = "get"; 
vinfo.routeConfig[1].middlewares = [];
*/
