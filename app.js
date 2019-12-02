// ./express-server/app.js
const express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	logger = require('morgan'),
	mongoose = require('mongoose'),
	//import bb from 'express-busboy';
	//import SourceMapSupport from 'source-map-support';
	// import routes
	generateRoutes = require('./routes/generate.route'),
	usersRoutes = require('./routes/users'),
	analyzeRoutes = require('./routes/analyser.route'),
	wordSchema = require('./models/word.model'),
	request = require('request'),
	wordsApi = require('./api/words.api'),
	textApi = require('./api/text.api'),
	DOMParser = require('dom-parser'),	
	constants = require('./constants'),
	{formatPromiseResult, handleError, promisify} = require('./utils');

// define our app using express
const app = express();
// express-busboy to parse multipart/form-dat
//bb.extend(app);
// allow-cors
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
});
// configure app
app.use(logger('dev'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.static(path.join(__dirname, 'public')));
// set the port
const port = process.env.PORT || 3001;
// connect to database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/poestro', { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).then(async() =>{
	let first = {
		"phrases" : [ 
			{
				"match" : "думи",
				"occasions" : 1,
				"moods" : [ 
					{
						"mood" : "happy",
						"occasions" : 1
					}
				]
			}
		],
		"word" : "гетьте",
		"emphasis" : 1,
		"__v" : 0
	};
	const verses = 1;
	const rows = 4;
	const emphases = 6;
	const metre = 'iamb';
	const surprise = 1;
	const mood = 'sad';
	const seeds = [];
	const rhyme = 'aabb'
	const poem = await textApi.generatePoem({mood, verses, rows, seeds, rhyme, emphases, metre, surprise})
	console.log(JSON.stringify(poem));
});

// add Source Map Support
//SourceMapSupport.install();

app.use('/generate', generateRoutes);
app.use('/users', usersRoutes);
app.use('/analyze', analyzeRoutes);

app.get('/', (req, res) => {
	return res.end('Api working');
});
// catch 404
app.use((req, res, next) => {
	res.status(404).send('<h2 align=center>Page Not Found!</h2>');
});
// start the server
app.listen(port, () => {
	console.log(`App Server Listening at ${port}`);
});