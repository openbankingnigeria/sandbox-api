
function log(d){
	console.log(d);
}
module.exports = function (service, test_data, log_for_postman) {

	if(log_for_postman){
		console.log(JSON.stringify(test_data));
	}
	service(test_data).then(log).catch(log);

}