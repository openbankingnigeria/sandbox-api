module.exports = {
	port:process.env.PORT || 1120,
	name: process.env.APPNAME || 'OB API',
	salt: process.env.PWSALT || '@#$%!!&^*---0981928', 
	tokenExpiration:"10 days", 
	JWTSECRET:process.env.JWTSECRET || '$*%&*$-KLIMIKELD-(*#(($*#'
}