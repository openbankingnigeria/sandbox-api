var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const service = require('mlar').mreq('services', 'directdebit/get_all');

function vinfo(req, res, next){ 
        const urlParams = req.params;
        service(urlParams).then(serviceResponse=> {
            utils.jsonS(res, serviceResponse, "The process was completed successfully"); 
        }).catch(service_error=> {
            utils.jsonF(res, null, service_error.message); 

        }) 
        
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [routemeta('get_direct_debit', 'dev')];
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
