const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let wordSchema = new Schema({
  word: String,
  emph: Number,
  phrases: Array,
  partOfSpeach: String
});
export default mongoose.model('Words', wordSchema);