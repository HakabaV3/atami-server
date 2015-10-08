#!/usr/bin/env node

'use strict';

var express = require('express'),
	config = require('./config.js');

var app = express();

//switch with environment variable
if (process.env.DEBUG) {
	config.$switch('dev');
} else {
	config.$switch('production');
}
console.log('environment: %s', config.name);

app.use(require('body-parser').json());
app.use('/api/v1', require('./router/api.js'));
app.use('/', [
	function(req, res, next) {
		console.error('deprecated entry point is used: / ');
		next();
	},
	require('./router/api.js')
]);

var server = app.listen(config.server.port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
