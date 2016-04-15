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
var generateMessageButtons = function(buttons) {
  var buttonsArray = [];

  for(var i=0; i<buttons.length; i++) {
    var button = buttons[i];

    if(button) {
      var payload = button["payload"];
      var text = button["text"];

      if((typeof payload === 'string' || payload instanceof String) && payload.startsWith("http")) {
        // send the user to a website
        buttonsArray.push({
          type: "web_url",
          url: payload,
          title: text
        });  
      } else {
        buttonsArray.push({
          type: "postback",
          payload: JSON.stringify(payload),
          title: text
        });  
      }
    }
  }

  log("Generated buttons:");
  log(JSON.stringify(buttonsArray));

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
          buttons: generateMessageButtons(buttons)
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

// extracts optin ref from a message
// [START extract_optin_ref_from_message]
var extractOptInRef = function (message) {
  var optin = message["optin"];

  if(optin) {
    return optin["ref"];
  }

  return null;
};
// [END extract_optin_ref_from_message]


// process a message
// [START process_message] 
var processTextMessage = function(messageText, senderId) {
  if(messageText && senderId) {

    if(messageText == "flip") {
      sendButtonMessage(
        "Head or tails?", 
        [
          { payload: "http://advokit.myawesomebot.com/flip?a=head&s=" + senderId, text: "head" },
          { payload: "http://advokit.myawesomebot.com/flip?a=tails&s=" + senderId, text: "tails" }
        ],
        senderId
      )

      return true;
    }

    if(messageText == "flip2") {
      sendButtonMessage(
        "Head or tails?", 
        [
          { payload: {command: "flip", value: "head", senderId: senderId} , text: "head" },
          { payload: {command: "flip", value: "tails", senderId: senderId} , text: "tails" }
        ],
        senderId
      )

      return true;
    }
  }

  return false;
};

var processOptinMessage = function(optinRef, senderId) {
  if(optinRef && senderId) {
    sendPlainTextMessage("Welcome!", senderId);

    return true;
  }

  return false;
};

var processMessage = function(requestBody) {
  var entries = requestBody["entry"];

  if(entries) {
    for(var entryIndex = 0; entryIndex < entries.length; entryIndex++) {

      var entry = entries[entryIndex];
      var messages = entry["messaging"];

      if(messages) {

        for(var messageIndex = 0; messageIndex < messages.length; messageIndex++) {
          var message = messages[messageIndex];
          
          log("message: ");
          log(JSON.stringify(message);

          var messageText = extractTextFromMessage(message);    
          var senderId = extractSenderIdFromMessage(message);

          if(messageText) {
            return processTextMessage(messageText, senderId);
          }

          var optinRef = extractOptInRef(message);

          if(optinRef) {
            return processOptinMessage(optinRef, senderId);
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