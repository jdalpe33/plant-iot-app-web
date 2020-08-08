var express = require('express');
var dateFormat = require('dateformat');
var router = express.Router();

var lastSave = null;
var currentData = null;

var gotStartRequest = false;
var gotStopRequest = false;

router.get('/', function (req, res) {
  var db = req.db;
  var collection = db.get('plant_iot_log');

  if (currentData == null) {
    console.log("current data is null");
    collection.findOne({}, { sort: { lastPumpActivation: -1 } }, function (e, docs) {
      currentData = docs;
      console.log(docs);

      if (currentData.isPumpOn == true) {
        currentData.isPumpOn = "En marche";
      } else if (currentData.isPumpOn == false) {
        currentData.isPumpOn = "À l'arrêt";
      }

      var myDate = new Date(currentData.lastPumpActivation);
      currentData.lastPumpActivation = dateFormat(myDate, "h:MM:ss, dddd, mmmm dS");

      res.render('home', {
        "currentData": currentData
      });
    });
  } else {

    //var myDate = new Date(currentData.lastPumpActivation);
    //currentData.lastPumpActivation = dateFormat(myDate, "h:MM:ss, dddd, mmmm dS");

    res.render('home', {
      "currentData": currentData
    });
  }

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

router.get('/start', function (req, res) {

  gotStartRequest = true;

  res.send();
});

router.get('/stop', function (req, res) {

  gotStopRequest = true;

  res.send();
});

router.get('/requests/start', function (req, res) {
  if (gotStartRequest) {
    res.status(200).send();
    gotStartRequest = false;
  } else {
    res.status(404).send();
  }
});

router.get('/requests/stop', function (req, res) {
  if (gotStopRequest) {
    res.status(200).send();
    gotStopRequest = false;
  } else {
    res.status(404).send();
  }
});

router.post('/addlog', function (req, res) {

  // Set our internal DB variable
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var moisture = req.body.moisture;
  var isPumpOn = req.body.isPumpOn;
  var lastPumpActivation = req.body.lastPumpActivation;
  var temperature = req.body.temperature;

  var utcSeconds = lastPumpActivation;
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(utcSeconds);

  if (lastSave == null) {
    lastSave = d;
  }

  console.log(d.getTime() - lastSave.getTime() + ">" + 1 * 60 * 1000);

  if (d.getTime() - lastSave.getTime() > 1 * 60 * 1000) {
    console.log("saving minute log");
    lastSave = d;
    // Set our collection
    var collection = db.get('plant_iot_log');

    // Submit to the DB
    collection.insert({
      "moisture": moisture,
      "isPumpOn": isPumpOn,
      "lastPumpActivation": d,
      "temperature": temperature,
    }, function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
      }
    });
  }

  if (isPumpOn == true) {
    isPumpOn = "En marche";
  } else if (isPumpOn == false) {
    isPumpOn = "À l'arrêt";
  }

  d = dateFormat(d, "h:MM:ss, dddd, mmmm dS");

  currentData = {
    "moisture": moisture,
    "isPumpOn": isPumpOn,
    "lastPumpActivation": d,
    "temperature": temperature,
  };

  res.send();
});

module.exports = router;
