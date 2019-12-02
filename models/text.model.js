const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let textSchema = new Schema({
  hash: String,
  emphases: Number,
  rhyme: String,
  rows: Number,
  verses: Number
});
module.exports = mongoose.model('text', textSchema);