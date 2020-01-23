var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const service = require('mlar').mreq('services', 'directdebit/update');

function vinfo(req, res, next){ 
        const payload = req.body;
        const params = req.params;
        service(payload, params).then(serviceResponse=> {
            utils.jsonS(res, serviceResponse.data, "The process was completed successfully");
        }).catch(service_error=> {
            utils.jsonF(res, null, service_error.message); 

        }) 
        
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:account/:mandateId"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [routemeta('update_direct_debit', 'dev')];
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
