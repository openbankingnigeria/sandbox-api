var utils = require('mlar')('mt1l');
const l = require('mlar').mreq('services', 'modelgenerics/list');
const e = require('mlar').mreq('services', 'modelgenerics/edit');
const c = require('mlar').mreq('services', 'modelgenerics/create');

function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        //service_data.id = req.apiuser.id;
        let service = null;
        if(service_data.ack != process.env.ACKACK) {
          utils.jsonF(res, null, 'ack failed'); 
          return;
        }
        if(req.params.action == 'list') {
          service = l;
        } else if (req.params.action == 'edit') {
          service = e;
        } else {
          service = c;
        }
        service(service_data)
        .then( service_response => {
            utils.jsonS(res, service_response, "The process was completed successfully"); 
        })
        .catch( service_error => {
            utils.jsonF(res, null, service_error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:action"; 
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [];
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
