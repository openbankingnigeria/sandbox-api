"use strict";
var _ = require('underscore');
const logger = require('mlar')('mongolog');
const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./scrubvals.json');
const models = require('mlar')('models');

var EXPRESS_UTILS = {};

function json_send(res, data, message, status, status_code, meta){
	data        = data || null;
	message     = message || "";
	status      = status || "success";
	status_code = status_code || 200;

	var response_json = {
		status:status,
		message:message,
		data:data
	};
	if(meta)
		response_json.meta = meta;

		logger({
			id: res._$app_reqid,
			type: 'api_call',
			comment: 'Response',
			headers: res.headers,
			code: res.statusCode,
			message: res.statusMessage,
			data: {
				status: response_json.status,
				message: response_json.message,
				data: scrubber(response_json.data, SCRUBVALS),
				meta: scrubber(response_json.meta, SCRUBVALS)
			}
		})
		models.reqlog.update({status: status}, {limit: 1, where:{requestId: res._$app_reqid}});
	res.status(status_code).json(response_json);
}

EXPRESS_UTILS.json = function (res, data, message, status, status_code, meta) {
	json_send(res, data, message, status, status_code, meta);
}

EXPRESS_UTILS.jsonS = function (res, data, message, meta) {
	json_send(res, data, message, 'success', 200, meta);
}


EXPRESS_UTILS.jsonF = function (res, data, message) {
	json_send(res, data, message, 'error', 400);
}

EXPRESS_UTILS.log = function (thing_to_log, num, title){
  num = num || 5;
  title = title || "LOGSTART";
  console.log("\n\n\n\n\n\n<*****************" + title + "***********************>");
  for(var i=0; i < num; i++)
  console.log("**************************************************");
  console.log(thing_to_log);
  for(var i=0; i < num; i++)
  console.log("**************************************************");
  console.log("<******************"+ title +"-END***********************>\n\n\n\n\n\n");

}

EXPRESS_UTILS.randomString = function (length, chars) {
  if(!chars){
    chars = '#aA!';
  }
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
};

EXPRESS_UTILS.getPaginationMeta = function(perpage, total, currentpage, baseurl, usequery ) {
	var meta = {};
	meta.total_pages = Math.ceil(total / perpage);
	currentpage = (currentpage * 1) || 1;
	meta.next_page = (currentpage && currentpage != meta.total_pages) ? currentpage + 1 : null;
	meta.prev_page = (currentpage && currentpage > 1) ? currentpage - 1 : null;

  var page_url = usequery ? '?page=' : '';
	meta.next_url =  (currentpage && currentpage != meta.total_pages) ? baseurl + "/" + page_url + meta.next_page : null;
	meta.prev_url =  (currentpage && currentpage > 1) ? baseurl + "" + page_url + meta.prev_page : null;
	return meta;
};


function getMiddleWares(names, middlewares, config){

	var extracted_middlewares = [], i = 0;
	for(; i < names.length; i++){

		const mwarelookup = names[i];
		let middleware = null;
		if (typeof mwarelookup === 'function') {
			middleware = mwarelookup;
		} else {
			middleware = middlewares[mwarelookup];
		}
		if(middleware){
			extracted_middlewares.push(middleware);
		}
	}

	return extracted_middlewares;

}

function unfurlConfig(handler, config, middlewares, router){

	var route_handler_funcs = [].concat( getMiddleWares(config.middlewares, middlewares) );
	route_handler_funcs.push(handler);
	router[config.method](config.path, route_handler_funcs);

}



function scaffoldRoute(handler, middlewares, router){
	
	//If config is not an array of route info
	if(handler.routeConfig && !handler.routeConfig.length){

		var config = handler.routeConfig;
		unfurlConfig(handler, config, middlewares, router); 

	}
	else if(handler.routeConfig && handler.routeConfig.length){


		handler
		.routeConfig
		.forEach( function (config) {
			unfurlConfig(handler, config, middlewares, router);
		});


	}

	return router;

}


EXPRESS_UTILS.coalesce = function (destination, sources) {

	var _destination = _.clone(destination);
	var _sources = [].concat(sources);

	_sources
	.forEach( (source) => {

		_.extend(_destination, source);

	});

	return _destination;

} 

EXPRESS_UTILS.buildRoutes = function(handlers, middlewares, router){

	var handler_names = Object.keys(handlers);
	if(handler_names.length){

		handler_names
		.forEach( function (handler_name) {

			var handler = handlers[handler_name]; 
			scaffoldRoute(handler, middlewares, router); 

		});

	}
	return router;

}

EXPRESS_UTILS.yyyymmdd = function (datestring) {
	const nd = new Date(datestring);
	const yyyy = nd.getFullYear() + '';
	const mm = ((nd.getMonth() + 1) + '').padStart(2, '0');
	const dd = ((nd.getDate()) + '').padStart(2, '0');
	return `${yyyy}${mm}${dd}`;
}

EXPRESS_UTILS.jp = function (jsonstring) {
	let parsedjson = {};
	try {
		parsedjson = JSON.parse(jsonstring);
	} catch(e) {
		parsedjson = null;
	}
	return parsedjson
}

EXPRESS_UTILS.set_default = function (object, key, optional_default) {
	// Object is mutated by reference
	if (typeof object[key] === 'undefined' || !object[key]) {
		object[key] = optional_default || 'N/A';
	}
}


module.exports = EXPRESS_UTILS;