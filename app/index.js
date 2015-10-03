'use strict';

var express = require('express');
var app = express();

app.use('/image', require('./router/image.js'));

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
