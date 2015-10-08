'use strict';

var express = require('express');
var app = express();

app.use(require('body-parser').json());

app.use('/api/v1', require('./router/api.js'));
app.use('/', require('./router/api.js'));

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
