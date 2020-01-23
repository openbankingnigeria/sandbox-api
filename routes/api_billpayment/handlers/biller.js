var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'billpayment/search_biller');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        service_data.fetch_one = 1;
        service(service_data)
        .then( service_response => {
            utils.json(res, service_response, "SUCCESFUL", "00");
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/billers/:billerId(\\d+)"; //no param customer id will be inferred from the header token passed
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [routemeta('billpayment_biller', 'dev')];
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
