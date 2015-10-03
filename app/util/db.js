'use strict';

var mongodb = require('mongodb');

var pGetDB = new Promise(function(resolve, reject) {
	mongodb.MongoClient.connect('mongodb://localhost:27017/atami', function(err, db) {
		if (err) {
			reject(err);
		} else {
			resolve(db);
		}
	});
});

var _ = module.exports;

_.pFind = function(collectionName, query) {
	return pGetDB.then(function(db) {
		return new Promise(function(resolve, reject) {
			db.collection(collectionName).find(query, function(err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	});
};

_.pInsert = function(collectionName, query) {
	return pGetDB.then(function(db) {
		return new Promise(function(resolve, reject) {
			db.collection(collectionName).insertOne(query, function(err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	});
};
