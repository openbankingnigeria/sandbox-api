var utils = require('mlar')('mt1l');
function vinfo(req, res, next){ 

		utils.jsonS(res, {
			API:"OB-SANDBOX-META",
			VERSION:"V1.0.0"
		}, "API-INFO"); 

	 

}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/version"; 
vinfo.routeConfig.method = "all"; 
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
