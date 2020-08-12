var express = require('express');
var dateFormat = require('dateformat');
var router = express.Router();

var lastSave = new Date(0);
var currentData = null;

var gotStartRequest = false;
var gotStopRequest = false;

router.get('/', function (req, res) {
  var db = req.db;
  var collection = db.get('plant_iot_log');

  collection.findOne({}, { sort: { epoch: -1 } }, function (e, docs) {
    if (currentData == null) {
      currentData = docs;
    }

    var myDate = new Date(currentData.epoch);
    currentData.epoch = dateFormat(myDate, "h:MM:ss, dddd, mmmm dS");

    res.render('home', {
      "currentData": currentData
    });
  });
});

router.get('/start', function (req, res) {

  gotStartRequest = true;

  res.send();
});

router.get('/stop', function (req, res) {

  gotStopRequest = true;

  res.send();
});

router.get('/data', function (req, res) {
  var db = req.db;
  var collection = db.get('plant_iot_log');



  collection.findOne({}, { sort: { epoch: -1 } }, function (e, docs) {
    if (currentData == null) {
      currentData = docs;
    }

    var dataToSend = currentData;

    d = dateFormat(dataToSend.epoch, "h:MM:ss, dddd, mmmm dS");
    dataToSend.epoch = d;

    res.send(dataToSend);
  });
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
  console.log(req.body);
  var moisture = req.body.moisture;
  var isPumpOn = req.body.isPumpOn;
  var epoch = req.body.epoch;
  var temperature = req.body.temperature;

  var date = new Date(0);
  date.setUTCSeconds(epoch);
  epoch = date;

  if (lastSave == null) {
    lastSave = new Date(0);
  }

  console.log(new Date().getTime() - lastSave.getTime() + ">" + 1 * 60 * 1000);

  if (new Date().getTime() - lastSave.getTime() > 1 * 60 * 1000) {
    console.log("saving minute log");
    lastSave = new Date();
    // Set our collection
    var collection = db.get('plant_iot_log');



    // Submit to the DB
    collection.insert({
      "moisture": moisture,
      "isPumpOn": isPumpOn,
      "epoch": epoch,
      "temperature": temperature,
    }, function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
      }
    });
  }

  //d = dateFormat(d, "h:MM:ss, dddd, mmmm dS");

  currentData = {
    "moisture": moisture,
    "isPumpOn": isPumpOn,
    "epoch": epoch,
    "temperature": temperature,
  };

  res.send();
});

module.exports = router;
