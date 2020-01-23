module.exports = function (req, res, next) {
	req.UID = Date.now(); next();
}