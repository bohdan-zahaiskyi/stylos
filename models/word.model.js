const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let wordSchema = new Schema({
  word: String,
  emphasis: Number,
  phrases: Array,
  partOfSpeach: String
});
module.exports = mongoose.model('words', wordSchema);