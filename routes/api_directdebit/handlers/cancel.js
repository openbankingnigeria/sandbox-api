var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const service = require('mlar').mreq('services', 'directdebit/cancel');

function vinfo(req, res, next){ 
        const urlParams = req.params;
        service(urlParams).then(serviceResponse=> {
            utils.json(res, serviceResponse, "The process was completed successfully", "00");
        }).catch(service_error=> {
            utils.jsonF(res, null, service_error.message); 

        }) 
        
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:mandateId/cancel"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('cancel_direct_debit', 'dev')];
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
