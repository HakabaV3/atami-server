'use strict';

var mongodb = require('mongodb');

var _ = module.exports;

var pGetDB = new Promise(function(resolve, reject) {
	mongodb.MongoClient.connect('mongodb://localhost:27017/atami', function(err, db) {
		if (err) {
			reject(err);
		} else {
			_.db = db;
			resolve(db);
		}
	});
});

_.pGetDB = pGetDB;
