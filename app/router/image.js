'use strict';
var QUERY_DELIMITER = ',';

var express = require('express'),
	ObjectId = require('mongodb').ObjectId,
	db = require('../util/db.js'),
	request = require('request');

var router = new express.Router();
var collection;

db.pGetDB
	.then(function(db) {
		collection = db.collection('stamps');
	});

router.get('/search', getImageByKeywords);
router.get('/all', getImageAll);
router.get('/:id', getImageById);
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

	keywords = keywords.map(function(keyword) {
		return new RegExp(keyword);
	});

	collection.find({
		keywords: {
			$in: keywords
		}
	}).toArray(function(err, docs) {
		if (err) return sendError(res, err);

		res.json(docs);
	});
}

function getImageAll(req, res) {
	console.log('getImageAll');

	collection.find({
		// _id: {
		// 	$gt: new ObjectId(from)
		// }
		//@TODO support from & limit
		// }).limit(count).toArray(function(err, docs) {
	}).toArray(function(err, docs) {
		if (err) return sendError(res, err);

		res.json(docs);
	});
}

function getImageById(req, res) {
	var id = req.params.id;

	console.log('getImageById');
	console.log(id);

	collection.findOne({
		_id: new ObjectId(id)
	}, function(err, doc) {
		if (err || !doc) {
			console.error(err);
			res.status(404);
			return;
		}

		request(doc.url).pipe(res);
	});
}

function registerNewImage(req, res) {
	var body = req.body,
		url, keywords, id, proxiedUrl;

	console.log('registerNewImage');
	console.log(body);

	url = body.url;
	keywords = (body.q || '').split(QUERY_DELIMITER);
	id = new ObjectId();
	proxiedUrl = 'http://atami.kikurage.xyz/image/' + id.toString();

	collection.insert({
		_id: id,
		_removed: false,
		created: parseInt(Date.now() / 1000), //adjust for UNIX time format
		keywords: keywords,
		url: url,
		proxiedUrl: proxiedUrl
	}, function(err) {
		if (err) return sendError(res, err);

		res.json('');
	});
}

function deleteImageById(req, res) {
	var id = req.params.id;

	console.log('deleteImageById');
	console.log(id);

	collection.update({
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
