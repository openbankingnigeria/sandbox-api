var maps = {
    		'Administrator':{
    			'post_d_admin_update_merchant_status':0,
    			'post_d_admin_reset_merchant_password':0,
    			'post_d_admin_toggle_env':0,
    			'get_d_customers':1,
                'get_d_settlements':1,
                'post_d_settlements_initiate':1,
                'get_d_transactions':1,
                'get_d_merchants':1
    		},
    		'User':{
    			'post_d_admin_update_merchant_status':0,
                'post_d_admin_reset_merchant_password':0,
                'post_d_admin_toggle_env':0,
                'post_d_settlements_initiate':0,
                'get_d_customers':1,
                'get_d_settlements':1,
                'get_d_transactions':1,
                'get_d_merchants':1
    		},
    		'Normal User':{
    			'post_d_admin_update_merchant_status':0,
                'post_d_admin_reset_merchant_password':0,
                'post_d_admin_toggle_env':0,
                'post_d_settlements_initiate':0,
                'get_d_customers':1,
                'get_d_settlements':1,
                'get_d_transactions':1,
                'get_d_merchants':0
    		}
}


var models = require('mlar')('models');
var role_maps = [];
for(var p  in maps){

    for(var q  in maps[p]){
        role_maps.push({
            role:p,
            path:q,
            accessible:maps[p][q]
        })
    }

}
//console.log(role_maps);
//models.rolemap.bulkCreate(role_maps);