var models = require('../models');
var login = require('../services/login');
var decodeToken = require('../services/jwt.verify');


models.question.findAll({
	include:[{
		model:models.answer,
		required:false, 
		where:{
			id:null
		},
		order:[['createdAt', 'DESC']]
	}]
}).then(qs => {
	 
	qs = qs.map((s) => {return s.toJSON();});
	console.log(qs);

})