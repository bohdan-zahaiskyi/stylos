var express = require('express');
var router = express.Router();
const phraseSchema = require('../models/phrase.model');
const wordSchema = require('../models/word.model.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/text', (req, res) => {
    let params = req.body;
    console.log("HALT! params: ", params);
    const request = require('request');

    //console.log("PoemStruct: ", JSON.stringify(poemStruct));

/*request('https://www.slovnyk.ua/?swrd=%D0%BA%D0%B0%D0%BF%D1%83%D1%81%D1%82%D0%B0', {}, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body);
  console.log(body.explanation);
});*/

});

module.exports = router;
