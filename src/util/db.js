'use strict';

var mongodb = require('mongodb'),
	config = require('../config.js');

var _ = module.exports;

var pGetDB = new Promise(function(resolve, reject) {
	mongodb.MongoClient.connect(config.db.url, function(err, db) {
		if (err) {
			console.log(err);
			reject(err);
		} else {
			_.db = db;
			resolve(db);
		}
	});
});

_.pGetDB = pGetDB;
