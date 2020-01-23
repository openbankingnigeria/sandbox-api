const mongoose = require('mongoose');
const modelName = 'log'; //model for just storing random stuff 
const Schema = mongoose.Schema;
const _schemConfig = { 
  log_id: String, //Dump Type 
  comment: String, //Dump Type 
  type: String,
  data: {
      type: Schema.Types.Mixed
  },
  ts: Number
}
const _schemaObject = new Schema(_schemConfig);
module.exports = mongoose.model(modelName, _schemaObject);