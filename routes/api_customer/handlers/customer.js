var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'customer/search');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        service_data.fetch_one = 1;
        service(service_data)
        .then( service_response => {
            utils.jsonS(res, service_response, "The process was completed successfully"); 
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = [{}, {}];
vinfo.routeConfig[0].path = "/:id"; 
vinfo.routeConfig[0].method = "get"; 
vinfo.routeConfig[0].middlewares = [routemeta('customer_single', 'user')];

vinfo.routeConfig[1].path = "/bvn/:bvn"; 
vinfo.routeConfig[1].method = "get"; 
vinfo.routeConfig[1].middlewares = [routemeta('customer_bvn', 'user')];
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
