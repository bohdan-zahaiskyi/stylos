// ./express-server/app_hooked.js
require('@babel/polyfill');
require('babel-register')({
    presets: ['es2015-node6'],
    plugins: ["transform-object-rest-spread"]
});
require('./app.js');