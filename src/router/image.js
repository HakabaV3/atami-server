'use strict';
var QUERY_DELIMITER = ',';

var express = require('express'),
	request = require('request'),
	Image = require('../model/image.js');

var router = new express.Router();

router.post('/:id/tag', postTag);
router.delete('/:id/tag', deleteTag);
router.get('/search', getImageSearch);
router.get('/all', getImageAll);
router.get('/:id', getImageById);
router.post('/', postImage);
router.delete('/:id', deleteImageById);

function postTag(req, res) {
	var body = req.body,
		id = req.params.id,
		tag = body.tag;

	console.log('postTag');
	console.log(tag);

	Image.pSetTag(id, tag)
		.then(function() {
			res.send('');
		})
		.catch(sendError(res));
}

function deleteTag(req, res) {
	var query = req.query,
		id = req.params.id,
		tag = query.tag;

	console.log('deleteTag');
	console.log(tag);

	Image.pUnsetTag(id, tag)
		.then(function() {
			res.send('');
		})
		.catch(sendError(res));
}

function getImageSearch(req, res) {
	var query = (req.query.q || '').split(QUERY_DELIMITER);

	console.log('getImageSearch');
	console.log(query);

	if (query.length === 0 ||
		(query.length === 1 && query[0] === '')) {
		return getImageAll(req, res);
	}

	Image.pFindByQuery(query)
		.then(function(images) {
			res.json(images);
		})
		.catch(sendError(res));
}

function getImageAll(req, res) {
	console.log('getImageAll');

	Image.pGetAll()
		.then(function(images) {
			res.json(images);
		})
		.catch(sendError(res));
}

function postImage(req, res) {
	var body = req.body,
		url, tags;

	console.log('postImage');
	console.log(body);

	url = body.url;
	tags = body.tags;

	Image.pCreate(url, tags)
		.then(function(image) {
			return res.json(image);
		})
		.catch(sendError(res));
}

function deleteImageById(req, res) {
	var id = req.params.id;

	console.log('deleteImageById');
	console.log(id);

	Image.pRemove(id)
		.then(function() {
			res.send('');
		})
		.catch(sendError(res));
}

function getImageById(req, res) {
	var id = req.params.id;

	console.log('getImageById');
	console.log(id);

	Image.pFindById(id)
		.then(function(image) {
			request(image.url).pipe(res);
		})
		.catch(sendError(res));
}

function sendError(res, status) {
	return function(err) {
		console.error(err);
		res.sendStatus(status || 500);
	};
}

module.exports = router;
