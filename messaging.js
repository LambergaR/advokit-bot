var logging = require('./lib/logging')();
var request = require('request');

function log(value) {
  logging.info("ADVOKIT-BOT: " + value);
}

var sendJson = function(json) {
  if(json) {
    log(JSON.stringify(json));

    request(
      {
        url: 'https://graph.facebook.com/v2.6/me/messages?access_token=CAAN79d6at8MBAKM9O2rPO3qiqvE26mHUJlRCqO6bL2bKHTFIqzXbT7mbgD4R1NYCZBRGLlY0CffWo1T1dDgSprXJzZCZCgLpSeKpQr3m6TvSD87OwSqdwTNfgb3uwh6MxfYzEZB4CsI27M1FZAoKjZANZCZBZAEcclI5OsJmm3usGERgLUa8TqUVxO6XWduetZAX8ZD',
        method: 'POST',
        
        json: json
      }, function(error, response, body){
        if(error) {
          log(error);
        } else {
          log(response.statusCode, body);
        }
      }
    );  
  }
};

// send a plain text message
// [START send_plain_text_message]
var sendPlainTextMessage = function (text, senderId) {
  sendJson({
    recipient: {
      id: senderId
    },
    message: {
      text: text
    }
  });
};
// [END send_plain_text_message]

// send a button message
// [START send_button_message]
var generateUrlButtons = function(buttons) {
  var buttonsArray = [];

  for(var i=0; i<buttons.length; i++) {
    var button = buttons[i];

    if(button) {
      buttonsArray.push({
        type: "web_url",
        url: button["url"],
        title: button["title"]
      });
    }
  }

  return buttonsArray;
}

var sendButtonMessage = function(text, buttons, senderId) {
  sendJson({
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: generateUrlButtons(buttons)
        }
      }
    }
  });
}
// [END send_button_message]


// extracts sender id from a message
// [START extract_sender_id_from_message]
var extractSenderIdFromMessage = function (message) {
  var sender = message["sender"];

  if(sender) {
    return sender["id"];
  }

  return null;
};
// [END extract_sender_id_from_message]


// extracts text from a message
// [START extract_sender_id_from_message]
var extractTextFromMessage = function(message) {
  var messageContainer = message["message"];

  if(messageContainer && messageContainer["text"]) {
    var messageText = messageContainer["text"];
    return messageText;
  }

  return null;
};
// [END extract_sender_id_from_message]


// process a message
// [START process_message] 
var processMessage = function(requestBody) {
  var entries = requestBody["entry"];

  if(entries) {
    for(var entryIndex = 0; entryIndex < entries.length; entryIndex++) {

      var entry = entries[entryIndex];
      var messages = entry["messaging"];

      if(messages) {
        for(var messageIndex = 0; messageIndex < messages.length; messageIndex++) {
          var message = messages[messageIndex];
          
          var messageText = extractTextFromMessage(message);    
          var senderId = extractSenderIdFromMessage(message);

          if(messageText && senderId) {

            if(messageText == "flip") {
              sendButtonMessage(
                "Head or tails?", 
                [
                  { url: "http://advokit.myawesomebot.com/flip?a=heads", title: "heads" },
                  { url: "http://advokit.myawesomebot.com/flip?a=tails", title: "tails" }
                ],
                senderId
              )
            } else {
              sendPlainTextMessage(messageText, senderId);  
            }
            
            return true;
          }
        }
      }
    }
  }

  return false;
};
// [END process_message] 

module.exports = {
  processMessage: processMessage,
  sendPlainTextMessage: sendPlainTextMessage
}