var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'transaction/complete');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        service_data.fetch_one = 1;
        service_data.status_check = 1;
        service(service_data)
        .then( service_response => {
            if(service_response && service_response.status === 'FAILED'){
                utils.jsonF(res, service_response, "Completion Error"); 
            }else {
                utils.jsonS(res, service_response, "The process was completed successfully"); 
            }
            
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/complete"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('transaction_completion', 'dev')];
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
