'use strict';
var QUERY_DELIMITER = ',';

var express = require('express'),
	db = require('../util/db.js');

var router = new express.Router();

router.get('/search', function(req, res) {
	var query = req.query,
		keywords = (query.q || '').split(QUERY_DELIMITER);

	db.pFind('stamps', {
			keywords: keywords
		})
		.then(function() {
			res.send(keywords.join('\n'));
		})
		.catch(function(err) {
			console.error(err);
			res.sendStatus(500);
		});
});

module.exports = router;
