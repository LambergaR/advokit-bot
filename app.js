'use strict';

var express = require('express');
var logging = require('./lib/logging')();
var messaging = require('./messaging');
var template = require('./template');
var config = require('./config')
var bodyParser = require('body-parser');

var util = require('util');

var app = express();

// [START requests]
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.use(logging.requestLogger);
// [END requests]

function log(value) {
  logging.info("ADVOKIT-BOT: " + value);
}

var test = config.v.fbAppId;
log(test);

// [START login]
// Say hello!
app.get('/', function (req, res) {
  res.status(200).send(template.renderLogin(config.v.fbPageId, config.v.fbAppId));
});
// [END login]

// [START webhook_token]
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === "here-be-dragons") {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});
// [END webhook_token]

// [START webhook_post]
app.post('/webhook', function (req, res) {

  log(JSON.stringify(req.body));

  if(messaging.processMessage(req.body)) {
    log("message processed");
  } else {
    log("no entries");
  }
  
  res.status(200).send();
})
// [END webhook_post]

// [START coin_flip]
app.get('/flip', function (req, res) {
  log(JSON.stringify(req.query));

  if(req.query && req.query.a && req.query.s) {
    var success = false;

    if(Math.random() > 0.5) {
      if(req.query.a == "head") {
        success = true;
      }
    } else {
      if(req.query.a == "tails") {
        success = true;
      }
    }

    if(success) {
      messaging.sendPlainTextMessage("lucky! :)", req.query.s);     
    } else {
      messaging.sendPlainTextMessage("sorry :(", req.query.s);
    }

    var response = {
      success: success
    };

    res.status(200).send(response);
  }

  res.status(404).send();
})
// [END coin_flip]

// [START send_product]
app.post('/send/product', function(req, res) {
  log(JSON.stringify(req.body));

  if(req.body && req.body.productIds && req.body.sender) {
    var productIds = req.body.productIds;
    messaging.sendProductMessage(productIds, req.body.sender);

    res.status(200).send();
  }

  res.status(404).send();
  
});
// [END send_product]

// [START errors]
app.use(logging.errorLogger);

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});
// [END errors]


// [START server]
if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    log(util.format('App listening at http://%s:%s', host, port));
  });
  // [END server]
}

module.exports = app;