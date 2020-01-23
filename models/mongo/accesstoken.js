/**
 * accessToken: String,
	accessTokenExpiresAt: Date,
	refreshToken: String,
	refreshTokenExpiresAt: Date,
	client: Object,
	user: Object
 */
const mongoose = require('mongoose');
const modelName = 'accesstoken'; //model for just storing random stuff 
const Schema = mongoose.Schema;
const _schemConfig = { 
  accessToken: String,
	accessTokenExpiresAt: Date,
	refreshToken: String,
	scope: String,
	refreshTokenExpiresAt: Date,
	client: {
      type: Schema.Types.Mixed
  },
	user: {
      type: Schema.Types.Mixed
  }
}
const _schemaObject = new Schema(_schemConfig);
module.exports = mongoose.model(modelName, _schemaObject);