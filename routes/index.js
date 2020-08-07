var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  var db = req.db;
  var collection = db.get('plant_iot_log');

  var currentData = null
  collection.findOne({}, { sort: { lastPumpActivation: -1 } }, function (e, docs) {
    currentData = docs;
    console.log(docs);

    res.render('home', {
      "currentData": currentData
    });
  });

  //var updatedData = db.get('plant_iot_log').find().sort({ lastPumpActivation: -1 }).limit(1);
  /*
  collection.find({}, { sort: { lastPumpActivation: -1 } }, function (e, docs) {
    res.render('plantlog', {
      "currentData": currentData,
      "logs": docs
    });
  });
  */
});

router.post('/addlog', function (req, res) {

  // Set our internal DB variable
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var moisture = req.body.moisture;
  var isPumpOn = req.body.isPumpOn;
  var lastPumpActivation = req.body.lastPumpActivation;

  var utcSeconds = lastPumpActivation;
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(utcSeconds);

  // Set our collection
  var collection = db.get('plant_iot_log');

  // Submit to the DB
  collection.insert({
    "moisture": moisture,
    "isPumpOn": isPumpOn,
    "lastPumpActivation": d,
  }, function (err, doc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem adding the information to the database.");
    }
    else {
      // And forward to success page
      res.send();
    }
  });

});

module.exports = router;
