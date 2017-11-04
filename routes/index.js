var express = require('express');
var router = express.Router();

var roomName,
    name;

/* GET home page. */
router.get('/', function(req, res, next) {
  roomName = req.query.roomName;
  name = req.query.name;
  console.log(roomName);
  console.log(name);

  res.render('index', { title: 'Express'});
});

module.exports = router;
module.exports.roomName = roomName;
module.exports.name = name;
