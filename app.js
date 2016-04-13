'use strict';

var express = require('express');
var logging = require('./lib/logging')();
var bodyParser = require('body-parser')

var app = express();


// [START requests]
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.use(logging.requestLogger);
// [END requests]

// [START hello_world]
// Say hello!
app.get('/', function (req, res) {
  res.status(200).send('Hello, world!');
  logging.info(req.body);
});
// [END hello_world]

// [START webhook_token]
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === "here-be-dragons") {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

app.post('/webhook', function (req, res) {
	logging.info(req.body);
	res.status(200).send();
})
// [END webhook_token]

// Add the error logger after all middleware and routes so that
// it can log errors from the whole application. Any custom error
// handlers should go after this.
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



if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
  // [END server]
}

module.exports = app;