var mongoose = require('mongoose');

/**
 * Configuration.
 */
const models = require('mlar')('models');
const tokenModel = require('mlar').mreq('mongo_models', 'accesstoken');

// var clientModel = require('./mongo/model/client'),
// 	tokenModel = require('./mongo/model/token'),
// 	userModel = require('./mongo/model/user');

/**
 * Add example client and user to the database (for debug).
 */

var loadExampleData = function() {

	var client1 = new clientModel({
		id: 'application',	// TODO: Needed by refresh_token grant, because there is a bug at line 103 in https://github.com/oauthjs/node-oauth2-server/blob/v3.0.1/lib/grant-types/refresh-token-grant-type.js (used client.id instead of client.clientId)
		clientId: 'application',
		clientSecret: 'secret',
		grants: [
			'password',
			'refresh_token'
		],
		redirectUris: []
	});

	var client2 = new clientModel({
		clientId: 'confidentialApplication',
		clientSecret: 'topSecret',
		grants: [
			'password',
			'client_credentials'
		],
		redirectUris: []
	});

	var user = new userModel({
		username: 'pedroetb',
		password: 'password'
	});

	client1.save(function(err, client) {

		if (err) {
			return console.error(err);
		}
		console.log('Created client', client);
	});

	user.save(function(err, user) {

		if (err) {
			return console.error(err);
		}
		console.log('Created user', user);
	});

	client2.save(function(err, client) {

		if (err) {
			return console.error(err);
		}
		console.log('Created client', client);
	});
};


/*
 * Methods used by all grant types.
 */

var getAccessToken = function(token, callback) {

	tokenModel.findOne({
		accessToken: token
	}).lean().exec((function(callback, err, token) {

		if (!token) {
			console.error('Token not found');
		}

		callback(err, token);
	}).bind(null, callback));
};

/**
 * 
{
	id: String,
	clientId: String,
	clientSecret: String,
	grants: [String],
	redirectUris: [String]
}
 */
const scopes = [
	"openid",
	"profile",
	"email",
	"address",
	"phone",
	"account",
	"transaction",
	"branch",
	"atm",
	"pos",
	"customer",
	"fraud"
];
const scopeDict = {};
scopes.forEach(s => {scopeDict[s] = 1});

var getClient = function(clientId, clientSecret, callback) {
	console.log(clientId, clientSecret);
  models.apiuser.findOne({ raw: true, where: {
    apikey: clientId, 
    apisecret: clientSecret 
  }}).then( apiuser => {
		let notFoundError =  null; //new Error('Client not found');
		let returnClient = null;
    if(!apiuser) {
      notFoundError = new Error('Client not found');
    } else {
    returnClient = {
      id: apiuser.id,
      clientId,
      clientSecret,
      grants: ["password", "refresh_token", "client_credentials"],
      redirectUris: [apiuser.callback_url]
    } }
    callback(notFoundError, returnClient);
  }).bind(null, callback);
  
};

var saveToken = function(token, client, user, callback) {

	if(!token.scope) throw new Error('Scope is required');
	if(!token.scope.split) throw new Error('Scope is invalid');
	const scopes = token.scope.toLowerCase().split(' ');
	scopes.forEach(s => {
		if(!scopeDict[s]) {
			throw new Error(`Scope ${s} is not allowed`);
		}
	})
	token.client = {
		id: client.clientId
	};

	token.user = {
		username: user.username,
		userInfo: user.userInfo
	};

	var tokenInstance = new tokenModel(token);
	tokenInstance.save((function(callback, err, token) {

		if (!token) {
			console.error('Token not saved');
		} else {
			token = token.toObject();
			delete token._id;
			delete token.__v;
		}

		callback(err, token);
	}).bind(null, callback));
};

/*
 * Method used only by password grant type.
 */

var getUser = function(username, password, callback) { 
    models.customer.findOne({ raw: true, where: {
      email: username, 
      idNumber: password 
    }}).then( user => {
			let notFoundError =  null; //new Error('Client not found');
			let returnUser = null;
      if(!user) {
        notFoundError = new Error('Invalid username/password');
      } else {
			 
			 const userInfo = {
				 sub: require('crypto').randomBytes(8).toString('hex'),
				 "name": "John Doe",
					"nickname": user.otherNames,
					"given_name": user.firstName,
					"middle_name": user.otherNames,
					"family_name": user.lastName,
					"profile": process.env.APIBASEURL + "/v1/customer/" + user.id,
					"zoneinfo": "Africa/Lagos",
					"locale": "en-US",
					"updated_at": new Date(user.updatedAt).getTime(),
					"email": user.email,
					"email_verified": true,
					"address": {
						"street_address": user.addrLine1,
						"locality": user.city,
						"region": user.state,
						"postal_code": user.postalCode,
						"country": "NG"
					},
					"phone_number": user.phone
			 }
       returnUser = {
        username,
				password,
				userInfo
      } }
      callback(notFoundError, returnUser);
    }).bind(null, callback);
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function(client, callback) {

	models.apiuser.findOne({ raw: true, where: {
    apikey: client.clientId, 
    apisecret: client.clientSecret 
  }}).then( apiuser => {
    let notFoundError =  null; //new Error('Client not found');
    if(!apiuser) {
      notFoundError = new Error('Client not found');
    }
    callback(notFoundError, {username: ''});
  }).bind(null, callback);
};

/*
 * Methods used only by refresh_token grant type.
 */

var getRefreshToken = function(refreshToken, callback) {

	tokenModel.findOne({
		refreshToken: refreshToken
	}).lean().exec((function(callback, err, token) {

		if (!token) {
			console.error('Token not found');
		}

		callback(err, token);
	}).bind(null, callback));
};

var revokeToken = function(token, callback) {

	tokenModel.deleteOne({
		refreshToken: token.refreshToken
	}).exec((function(callback, err, results) {

		var deleteSuccess = results && results.deletedCount === 1;
		let deleteError = null
		if (!deleteSuccess) {
			console.error('Token not deleted');
			deleteError = new Error("Token not deleted")
		}

		callback(deleteError, deleteSuccess);
	}).bind(null, callback));
};

/**
 * Export model definition object.
 */

module.exports = {
	getAccessToken: getAccessToken,
	getClient: getClient,
	saveToken: saveToken,
	getUser: getUser,
	getUserFromClient: getUserFromClient,
	getRefreshToken: getRefreshToken,
	revokeToken: revokeToken
};