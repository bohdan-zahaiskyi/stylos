const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let phraseSchema = new Schema({
  phrase: String,
  count: Number,
  
});
//export default mongoose.model('phrases', phraseSchema);