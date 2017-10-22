var express = require('express');
var router = express.Router();

var roomName,
    name;

/* GET home page. */
router.get('/', function(req, res, next) {
  roomName = req.query.roomName;
  name = req.query.name;

  res.render('index', { title: 'Express', roomName: roomName, name: name});
});

module.exports = router;
module.exports.roomName = roomName;
module.exports.name = name;
