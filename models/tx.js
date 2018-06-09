var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
 
var TxSchema = new Schema({
  txid: { type: String, unique: true, index: true, lowercase: true},
  vin: { type: Array, default: [] },
  vout: { type: Array, default: [] },
  total: { type: Number, default: 0 },
  timestamp: { type: Number, default: 0, index: true},
  blockhash: { type: String },
  blockindex: {type: Number, default: 0},
}, {id: false});

module.exports = mongoose.model('Tx', TxSchema);
