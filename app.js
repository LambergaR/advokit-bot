'use strict';

var express = require('express');
var logging = require('./lib/logging')();
var bodyParser = require('body-parser')
var request = require('request');

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

// [START hello_world]
// Say hello!
app.get('/', function (req, res) {
  log(req.body);
  res.status(200).send('Hello, world!');
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

	log(JSON.stringify(req.body));

  var entries = req.body["entry"];
  if(entries) {
    for(var i=0; i<entries.length; i++) {
    	var entry = entries[i];
    	var messages = entry["messaging"];

  		log("entry: " + entry["id"] + " @ " + entry["time"]);

  		if(messages) {
	  		for(var j=0; j<messages.length; j++) {
	  			var message = messages[j];

	  			if(message) {
  					var senderId = message["sender"]["id"];
  					var messageContainer = message["message"];


						var messageText = "TEST";
						if(messageContainer && messageContainer["text"]) {
							messageText = messageContainer["text"];

							log("  message from " + senderId + ": " + messageText);

							request(
								{
			    				url: 'https://graph.facebook.com/v2.6/me/messages?access_token=CAAN79d6at8MBAKM9O2rPO3qiqvE26mHUJlRCqO6bL2bKHTFIqzXbT7mbgD4R1NYCZBRGLlY0CffWo1T1dDgSprXJzZCZCgLpSeKpQr3m6TvSD87OwSqdwTNfgb3uwh6MxfYzEZB4CsI27M1FZAoKjZANZCZBZAEcclI5OsJmm3usGERgLUa8TqUVxO6XWduetZAX8ZD',
			    				method: 'POST',
			    				
			    				json: {
			        			recipient: {
			      					id: senderId
			        			},
			        			message: {
			        				text: messageText
			        			}
			    				}
								}, function(error, response, body){
			    				if(error) {
			        			console.log(error);
			    				} else {
			        			console.log(response.statusCode, body);
									}
								}
							);
						}
						
	  			} else {
	  				log("  no message");
	  			}
	    	}	
  		} else {
  			log("no messages")
  		}
    	
    }
  } else {
  	log("no entries");
  }
  
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