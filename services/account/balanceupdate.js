const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;


var spec = morx.spec({}) 
			   .build('id', 'required:true, eg:2')   
               .build('value', 'required:true, eg:2') 
               .build('type', 'required:false, eg:2') //debit | credit. default is debit. 
			   .end();

function service(data){

	var d = q.defer();
	
	q
	.fcall( () => {

		var result = morx.validate(data, spec, {throw_error:true});
		var params = result.params;

        params.value = params.value || 0; 
        params.type = params.type || 'debit';


        let sequelize_query = "UPDATE account SET availableBalance  = availableBalance - ? WHERE id = ? AND availableBalance > ?";
        let sequelize_replacements = [params.value, params.id, params.value];
        if(params.type == 'credit') {
            sequelize_query = "UPDATE account SET availableBalance  = availableBalance + ? WHERE id = ?";
            sequelize_replacements = [params.value, params.id];
        }

        var query = models.sequelize.query(sequelize_query, {
            replacements: sequelize_replacements,
            typse: models.sequelize.QueryTypes.UPDATE
        });
		return [params, query];
	}) 
	.spread((params, update) => { 

        if(update && update[0] && update[0].changedRows === 1){
            //console.log(updated_wallet); 
        }
        else{
            throw new Error("Balance Update failed: Insufficient funds");
        }
        
        d.resolve(true);

    }) 
	.catch( (err) => {

		//console.log(err);
		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;

/**
 * Response for update
 * [ OkPacket {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 0,
    serverStatus: 2,
    warningCount: 0,
    message: '(Rows matched: 1  Changed: 1  Warnings: 0',
    protocol41: true,
    changedRows: 1 },
  OkPacket {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 0,
    serverStatus: 2,
    warningCount: 0,
    message: '(Rows matched: 1  Changed: 1  Warnings: 0',
    protocol41: true,
    changedRows: 1 } ]
 */