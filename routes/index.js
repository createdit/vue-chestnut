var express = require('express');
var router = express.Router();
var argv = require('yargs').argv;
/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {
    title: '百忠牙科',
    prefix: (argv.dev) ? '' : '.min'
  });
});

module.exports = router;
