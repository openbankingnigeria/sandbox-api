var loader = require('../boot/loader');
var listeners = loader(__dirname, module.filename);
module.exports = function () {

	//init each listener in listeners folder
	for(var listener in listeners) {
		listeners[listener]();
	}

}