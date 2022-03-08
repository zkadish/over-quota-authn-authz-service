var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('GET: root');
  // res.render('index', { title: 'Express' });
});

router.get('/health-check', function(req, res, next) {
  console.log('GET: /health-check');
  res.send('Health Check');
});

module.exports = router;
