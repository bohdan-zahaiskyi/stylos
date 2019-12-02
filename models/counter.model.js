const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let counterSchema = new Schema({
  type: String,
  values: Array
});
module.exports = mongoose.model('counter', counterSchema);