var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'apiuser/createjwt');
function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        service(service_data, req.params.admin)
        .then( service_response => {
            utils.jsonS(res, service_response, "The process was completed successfully"); 
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = [{}, {}];
vinfo.routeConfig[0].path = "/magiclinks/:magic_link_token/verify"; 
vinfo.routeConfig[0].method = "post";
vinfo.routeConfig[0].middlewares = [];

vinfo.routeConfig[1].path = ":admin/magiclinks/:magic_link_token/verify"; 
vinfo.routeConfig[1].method = "post";
vinfo.routeConfig[1].middlewares = [];
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
