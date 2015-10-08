'use strict';

var map = {
	'dev': './config/dev.json',
	'production': './config/production.json'
};

module.exports.$switch = function(type) {
	var targetPath = map[type];

	if (!targetPath) throw new Error('Configuration "' + type + '" is not found.');

	var target = require(targetPath);

	Object.keys(target).forEach(function(key) {
		this[key] = target[key];
	}, this);
};
