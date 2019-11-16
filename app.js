// ./express-server/app.js
const express = require('express'),
  path  = require('path'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
//import bb from 'express-busboy';
//import SourceMapSupport from 'source-map-support';
// import routes
  indexRoutes = require('./routes/index'),
  usersRoutes = require('./routes/users');
  analyzeRoutes = require('./routes/analyser.route');

// define our app using express
const app = express();
// express-busboy to parse multipart/form-dat
//bb.extend(app);
// allow-cors
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
// configure app
app.use(logger('dev'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
//app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static(path.join(__dirname, 'public')));
// set the port
const port = process.env.PORT || 3001;
// connect to database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/poestro', {useNewUrlParser: true, useUnifiedTopology: true});

// add Source Map Support
//SourceMapSupport.install();

app.use('/index', indexRoutes);
app.use('/users', usersRoutes);
app.use('/analyze', analyzeRoutes);

app.get('/', (req,res) => {
  return res.end('Api working');
});
// catch 404
app.use((req, res, next) => {
  res.status(404).send('<h2 align=center>Page Not Found!</h2>');
});
// start the server
app.listen(port,() => {
  console.log(`App Server Listening at ${port}`);
});