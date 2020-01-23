var util = require('mlar')('mt1l');
var q = require('q');
var get_merchant = {}; //require('mlar').mreq('services', 'merchant/search');
var verify_token = {}; //require('mlar').mreq('services', 'auth/verify.token');
var models = require('mlar')('models');


function normalize(_path, _method){

	var path = _path;
	var method = _method || "GET";
	method = method.toLowerCase();

	path = path.replace(/\//g, '_').trim().toLowerCase();
	return method + "" + path;

}

function get_merchant_role_name (merchant){

	var role_name = merchant.role;

	if(!merchant.is_admin){
		role_name = "Normal User";
	}

	if(merchant.is_admin && !merchant.role){
		role_name = "User";
	}

	return role_name;

}

function decide_route_role_access(_route_map, role_path_id, merchant){

		var route_map = _route_map;

    	var grant_access = false;
    	merchant.role = get_merchant_role_name(merchant);

    	if(merchant.role == 'System Administrator' && merchant.is_admin){
    		grant_access = true;
    	}
    	else{

    		if(!merchant.is_admin){
    			merchant.role = "Normal User";
    		}

    		if(merchant.is_admin && !merchant.role){
    			merchant.role = "User";
    		}

    		grant_access = route_map[merchant.role] && route_map[merchant.role][role_path_id];

    	} 

    	return grant_access;


}


module.exports = function (req, res, next) {

	//console.log(req.path, req.method, normalize(req.path, req.method));
	req.role_path_id = normalize(req.path, req.method);
	//console.log(req.role_path_id);
	q
	.fcall( () => {


		var token = req.body.bs_auth_token || req.query.bs_auth_token || req.headers.bs_auth_token;
		
		//req.body.is_test = req.query.is_test = req.params.is_test = req.headers = is_test;
		
		if(!token) throw new Error('A merchant token is required to authenticate this request');

		return verify_token({token:token});
	})
	.then( verified_token_response => {

		//console.log(verified_token_response);
		
		if(!verified_token_response) throw new Error('Invalid token passed');

		var query = {fetch_one:1};
		query['id'] = verified_token_response.id;
		return get_merchant(query)

	})
	.then( merchant => {

		if(!merchant) throw new Error('Invalid merchant token passed');
		if(merchant.compliance_status == "RE") throw new Error('Merchant is blocked.');


		var role_name = get_merchant_role_name(merchant);
		//console.log(role_name);
		var role_is_accessible = false;
		if(role_name == "System Administrator"){
			role_is_accessible = {accessible:1};
		}else{
			role_is_accessible = models.rolemap.findOne({raw:true, where:{role:role_name, path:req.role_path_id}});
		}
		return [merchant, role_is_accessible]
	})
	.spread( (merchant, role_is_accessible) => {

		var is_test = merchant.merchant_env == "test" ? 1 : 0;
		is_test += "";
		req.body.is_test = req.query.is_test = req.params.is_test = req.headers.is_test = is_test;
		req.merchant = merchant;
 
		if(role_is_accessible && !role_is_accessible.accessible) throw new Error("You do not have sufficient rights to carry out this operation");

		next();

	})
	.catch( e => {

		util.jsonF(res, null, e.message);

	})

}