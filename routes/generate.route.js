var express = require('express');
const textApi = require('../api/text.api');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  console.log("HHHH");
  let params = req.body;
  
});
router.post('/generate', async function(req, res, next) {
  const params = req.body;
  let {verses, rows, emphases, metre, surprise, mood, seeds, rhyme} = params;
  console.log(verses, typeof verses)

  verses = parseInt(verses);
  rows = parseInt(rows);
  emphases = parseInt(emphases),
  surprise = parseInt(surprise);
  seeds = [];
  console.log(verses, typeof verses)
  const poem = await textApi.generatePoem({verses, rows, emphases, metre, surprise, mood, seeds, rhyme})
  return res.json({'success':true,'message':poem});
}); 
module.exports = router;
