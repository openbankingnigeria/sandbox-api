var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'cache/new');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 

        if (typeof req.body.phoneNumber == "number") {
            utils.jsonF(res, null, "Phone number should be a string"); 
        }
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        
        service({...service_data, stringify_json:1})
        .then( service_response => {
            utils.json(res, service_response, "The process was completed successfully", "00");
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/report"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('fraud_report', 'dev')];
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
