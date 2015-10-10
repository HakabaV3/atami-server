'use strict';

var ObjectId = require('mongodb').ObjectId,
	fs = require('fs'),
	path = require('path'),
	request = require('request'),
	db = require('../util/db.js'),
	config = require('../config.js');

var _ = module.exports,
	collection;

var ROOT = config.cache.root;

db.pGetDB
	.then(function(db) {
		collection = db.collection('stamps');
	});

function pMkdir(dirpath) {
	return new Promise(function(resolve, reject) {
		fs.stat(dirpath, function(err, stat) {
			if (!err) {
				if (stat.isDirectory()) {
					console.log('Directory "' + dirpath + '" is exist already.');
					return resolve();
				} else {
					return reject(new Error('File "' + dirpath + '" is exist already.'));
				}
			}

			fs.mkdir(dirpath, function(err) {
				if (err) return reject(err);

				console.log('Directory "' + dirpath + '" is created.');
				resolve();
			});
		});
	});
}

function setup() {
	pMkdir(path.join(ROOT));
	pMkdir(path.join(ROOT, './original'));
}

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

_.pFindByQuery = function(query, filter) {
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
		}, filter).toArray(function(err, images) {
			if (err) return reject(err);

			resolve(images);
		});
	});
};

_.pGetAll = function(filter) {
	return new Promise(function(resolve, reject) {
		collection.find({
			// _id: {
			// 	$gt: new ObjectId(from)
			// }
			//@TODO support from & limit
			// }).limit(count).toArray(function(err, docs) {
		}, filter).toArray(function(err, images) {
			if (err) return reject(err);

			resolve(images);
		});
	});
};

_.pCreate = function(url, tags) {
	return new Promise(function(resolve, reject) {
		var id = new ObjectId(),
			idStr = id.toString(),
			created = parseInt(Date.now() / 1000), // UNIX Time format
			proxiedUrl = 'http://atami.kikurage.xyz/image/' + idStr,
			cacheOriginUri = path.join(ROOT, './original/' + idStr);

		request(url)
			.on('end', function() {
				collection.insert({
					_id: id,
					tags: tags,
					created: created,
					url: url,
					proxiedUrl: proxiedUrl,
					cacheOriginUri: cacheOriginUri
				}, function(err, image) {
					if (err) return reject(image);

					resolve(image);
				});
			})
			.pipe(fs.createWriteStream(cacheOriginUri));
	});
};

_.pGetFileStream = function(id) {
	return _.pFindById(id)
		.then(function(image) {
			return new Promise(function(resolve) {
				var cacheOriginUri = image.cacheOriginUri;
				fs.stat(cacheOriginUri, function(err) {
					var stream;
					if (err) {
						// cache is not found.
						console.log('%s: cache is missed', id);

						stream = request(image.url);
						stream.pipe(fs.createWriteStream(cacheOriginUri));
					} else {
						console.log('%s: cache is hit', id);
						stream = fs.createReadStream(cacheOriginUri);
					}

					resolve(stream);
				});
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

setup();
