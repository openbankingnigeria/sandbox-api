
var FETCH_LIMIT = process.env.DEFAULT_FETCH_LIMIT;
var _ = require('underscore');
var logger = require('mlar')('logger');
module.exports = function (params, _config) {

	var config = _config || {};

	var replacement_params = _.omit(params, config.excludes || []);
	var page = params.page;
	FETCH_LIMIT = FETCH_LIMIT || config.per_page || 10;

	var query = {where:replacement_params, raw:true, limit: FETCH_LIMIT};
	var offset = page ? (page - 1) * FETCH_LIMIT : false;
    if(offset){
        query.offset = offset;
    }

     //Process to and from
        if(params.from){

            if(!replacement_params.createdAt)
            {
                replacement_params.createdAt = {};
            }
            replacement_params.createdAt.$gte = params.from + " 00:00:00"; 
        }

        if(params.to){

            if(!replacement_params.createdAt)
            {
                replacement_params.createdAt = {};
            }
            replacement_params.createdAt.$lte = params.to + " 23:59:59";
        }


    /*if(params.q){

        params.$or = [
            {email:{
                $like:'%'+params.q+'%'
            }},
            {phone:{
                $like:'%'+params.q+'%'
            }},
            {fullName:{
                $like:'%'+params.q+'%'
            }}
        ];

    }
    delete params.q;*/
    query.order = config.order || [['createdAt','DESC']]; 
    query.buider_options = {
     page:page || 1,
     per_page:FETCH_LIMIT   
    }



    //logger(query);
	return query;

}