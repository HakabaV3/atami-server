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

router.get('/search', getImageByKeywords);
router.get('/all', getImageAll);
router.post('/', registerNewImage);
router.delete('/:id', deleteImageById);

function getImageByKeywords(req, res) {
	var query = req.query,
		keywords = (query.q || '').split(QUERY_DELIMITER);

	console.log('getImageByKeywords');
	console.log(keywords);

	if (keywords.length === 0 ||
		(keywords.length === 1 && keywords[0] === '')) {
		return getImageAll(req, res);
	}

	collection.find({
		keywords: {
			$in: keywords
		}
	}).toArray(function(err, docs) {
		if (err) return sendError(res, err);

		res.json(docs.map(function(doc) {
			return doc.url;
		}));
	});
}

function getImageAll(req, res) {
	var query = req.query,
		from, count;

	console.log('getImageAll');

	if (query) {
		console.log(query);
		from = parseInt(query.from) || 0;
		count = parseInt(query.count) || 20;
	} else {
		console.log('query: none');
		from = 0;
		count = 20;
	}

	collection.find({
		_id: {
			$gt: new ObjectId(from)
		}
	}).limit(count).toArray(function(err, docs) {
		if (err) return sendError(res, err);

		res.json(docs.map(function(doc) {
			return doc.url;
		}));
	});
}

function registerNewImage(req, res) {
	var body = req.body,
		url, keywords;

	console.log('registerNewImage');
	console.log(body);

	url = body.url;
	keywords = (body.q || '').split(QUERY_DELIMITER);

	collection.insert({
		keywords: keywords,
		url: url
	}, function(err) {
		if (err) return sendError(res, err);

		res.json('');
	});
}

function deleteImageById(req, res) {
	var id = req.params.id;

	console.log('deleteImageById');
	console.log(id);

	collection.remove({
		_id: new ObjectId(id)
	}, function(err) {
		if (err) return sendError(res, err);

		res.json('');
	});
}

function sendError(res, err) {
	console.error(err);
	res.sendStatus(500);
}

module.exports = router;
