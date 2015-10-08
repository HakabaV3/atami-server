'use strict';

var ObjectId = require('mongodb').ObjectId,
	db = require('../util/db.js');

var _ = module.exports,
	collection;


db.pGetDB
	.then(function(db) {
		collection = db.collection('stamps');
	});

_.pFindById = function(id) {
	return new Promise(function(resolve, reject) {
		collection.findOne({
			_id: new ObjectId(id)
		}, function(err, image) {
			if (err) return reject(err);

			resolve(image);
		});
	});
};

_.pFindByQuery = function(query) {
	//@TODO tag以外にも対応

	var tags = query;

	return new Promise(function(resolve, reject) {
		tags = tags.map(function(tag) {
			return new RegExp(tag);
		});

		collection.find({
			tags: {
				$in: tags
			}
		}).toArray(function(err, images) {
			if (err) return reject(err);

			resolve(images);
		});
	});
};

_.pGetAll = function() {
	return new Promise(function(resolve, reject) {
		collection.find({
			// _id: {
			// 	$gt: new ObjectId(from)
			// }
			//@TODO support from & limit
			// }).limit(count).toArray(function(err, docs) {
		}).toArray(function(err, images) {
			if (err) return reject(err);

			resolve(images);
		});
	});
};

_.pCreate = function(url, tags) {
	return new Promise(function(resolve, reject) {
		var id = new ObjectId(),
			created = parseInt(Date.now() / 1000), // UNIX Time format
			proxiedUrl = 'http://atami.kikurage.xyz/image/' + id.toString();

		collection.insert({
			_id: id,
			tags: tags,
			created: created,
			url: url,
			proxiedUrl: proxiedUrl
		}, function(err, image) {
			if (err) return reject(image);

			resolve(image);
		});
	});
};

_.pUpdate = function(query, update) {
	return new Promise(function(resolve, reject) {
		collection.update(query, update, function(err) {
			if (err) return reject(err);

			resolve();
		});
	});
};

_.pRemove = function(id) {
	return new Promise(function(resolve, reject) {
		collection.remove({
			_id: new ObjectId(id)
		}, function(err) {
			if (err) return reject(err);

			resolve();
		});
	});
};

_.pSetTag = function(id, tag) {
	return _.pUpdate({
		_id: new ObjectId(id)
	}, {
		$addToSet: {
			tags: tag
		}
	});
};

_.pUnsetTag = function(id, tag) {
	return _.pUpdate({
		_id: new ObjectId(id)
	}, {
		$pull: {
			tags: tag
		}
	});
};
