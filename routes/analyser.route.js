var express = require('express');
const textApi = require('../api/text.api');
var router = express.Router();
const phraseSchema = require('../models/phrase.model');
const wordSchema = require('../models/word.model.js');
const {formatPromiseResult} = require('../utils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/text', async function(req, res) {
    let params = req.body;
    console.log("HALT! params: ", req.body);
    let [err,analyzed] = await formatPromiseResult(textApi.analyzeText(params));
    if(err) {
      console.log("HALT! bad!");
      return res.json({'success':true,'message':analyzed});
    }
    return res.json({'success':true,'message':analyzed});
});

module.exports = router;
