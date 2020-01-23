
var mlite = require('mlite')(process.env.LOGLITETOKEN || '5af5bf2f84f87700048e356a');
module.exports = function (data, label, type) {

	var do_console_log = !process.env.NO_CONSOLE_LOG;
	var send_mlite = process.env.SEND_MLITE_LOG;

	var _data = data;
	var _label = label || `LOG_ENTRY_${Date.now()}`;
	var _type = type || 'log';

	if(do_console_log){
		console.log(" ");
		console.log("***************************");
		console.log("***************************");
		console.log(_label, new Date());
		console.log(_data);
		console.log("***************************");
		console.log("***************************");
		console.log(" ");
	}

	if(send_mlite){
		//info or errorX
		mlite[_type]([_data], _label);
	}

}