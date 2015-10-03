'use strict';
var QUERY_DELIMITER = ',';

var express = require('express'),
	ObjectId = require('mongodb').ObjectId,
	db = require('../util/db.js');

var router = new express.Router();
var collection;

db.pGetDB
	.then(function(db) {
		collection = db.collection('stamps');
	});

router.get('/search', function(req, res) {
	var query = req.query,
		keywords = (query.q || '').split(QUERY_DELIMITER);

	// collection.find({
	// 	keywords: keywords
	// }, function(err, docs) {
	// 	if (err) return sendError(res, err);
	//
	// 	res.json(docs);
	// });
	res.json([
		'http://e-village.main.jp/gazou/image_gazou/gazou_0374.jpg',
		'http://e-village.main.jp/gazou/image_gazou/gazou_0378.jpg'
	]);
});

router.post('/', function(req, res) {
	var body = req.body,
		url = body.url,
		keywords = (body.q || '').split(QUERY_DELIMITER);

	collection.insert({
		keywords: keywords,
		url: url
	}, function(err) {
		if (err) return sendError(res, err);

		res.json('');
	});
});

router.delete('/:id', function(req, res) {
	var id = req.params.id;

	collection.remove({
		_id: new ObjectId(id)
	}, function(err) {
		if (err) return sendError(res, err);

		res.json('');
	});
});

router.get('/all', function(req, res) {
	var query = req.query,
		from = parseInt(query.from) || 0,
		count = parseInt(query.count) || 20;

	collection.find({
		_id: {
			$gt: new ObjectId(from)
		}
	}).limit(count).toArray(function(err, docs) {
		if (err) return sendError(res, err);

		res.json(docs);
	});
});

function sendError(res, err) {
	console.error(err);
	res.sendStatus(500);
}

module.exports = router;
