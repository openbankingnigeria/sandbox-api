var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'transaction/holdfund');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
        const service_data =req.body;
        // service_data.fetch_one = 1;
        service(service_data)
        .then( service_response => {
            utils.json(res, service_response.data, "Kindly enter the OTP sent to ****1412 to complete the transaction", "00");
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/holdfund"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('hold_fund', 'dev')];
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
