const express = require('express');
const router = express.Router();

const gtfs = require('../lib/gtfs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'People Mover Routes' });
});

module.exports = router;
