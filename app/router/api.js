'use strict';

var express = require('express');

var router = new express.Router();

router.use('/image', require('./router/image.js'));

module.exports = router;
