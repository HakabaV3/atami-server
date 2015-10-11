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

	db.pGetDB
		.then(function(db) {
			collection = db.collection('stamps');
		});
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
			proxiedUrl = config.server.entrypoint + '/image/' + idStr,
			cacheOriginalUri = path.join(ROOT, './original/' + idStr);

		request(url)
			.on('end', function() {
				collection.insert({
					_id: id,
					tags: tags,
					created: created,
					url: url,
					proxiedUrl: proxiedUrl,
					cacheOriginalUri: cacheOriginalUri
				}, function(err, image) {
					if (err) return reject(image);

					resolve(image);
				});
			})
			.pipe(fs.createWriteStream(cacheOriginalUri));
	});
};

_.pSetCacheOriginalUrl = function(id) {
	return _.pUpdate({
		_id: new ObjectId(id)
	}, {
		$set: {
			cacheOriginalUri: path.join(ROOT, './original/' + id)
		}
	});
};

_.pGetCacheOriginalFileStream = function(id) {
	return _.pFindById(id)
		.then(function(image) {
			if (image.cacheOriginalUri) return image;

			return _.pSetCacheOriginalUrl(id)
				.then(function() {
					return _.pFindById(id);
				});
		})
		.then(function(image) {
			return _.pGetLocalOrRemoteFileStream(
				image.cacheOriginalUri,
				image.url
			);
		});
};

_.pGetLocalOrRemoteFileStream = function(localUri, remoteUri) {
	var stream;

	return new Promise(function(resolve) {
		fs.stat(localUri, function(err) {
			if (err) {
				console.log('cache is missed: %s', localUri);

				stream = request(remoteUri);
				stream.pipe(fs.createWriteStream(localUri));

			} else {
				console.log('cache is hit: %s', localUri);

				stream = fs.createReadStream(localUri);
			}

			resolve(stream);
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
