'use strict';

var config = require('./config')

var keyFile = process.env.DATASTORE_KEYFILE ||
              process.env.GOOGLE_APPLICATION_CREDENTIALS;

// [START build_service]
var gcloud = require('gcloud');
var options = {
  projectId: config.v.project
};

if (keyFile) {
  options.keyFilename = "../advokit-bot-secret/myawesomebot-a62c478dcb77.json";
}

var datastore = gcloud.datastore(options);
// [END build_service]

// [START logging]
var logging = require('./lib/logging')();
function log(value) {
  logging.info("ADVOKIT-BOT: " + value);
}
// [END logging]

// [START cart_key]
function getKey(userId) {
  var cartKey = datastore.key([
      'Cart',
      userId
    ]);
  log("Generating key for user " + userId);

  return cartKey;
}
// [END cart_key]

// [START upsert_cart]
var upsertCart = function(cart, callback) {
  // var cartKey = datastore.key("Cart");

  datastore.upsert({
    key: getKey(cart.userId),
    data: cart
  }, callback);
};
// [END upsert_cart]

// [START get_cart] 
var getCart = function(userId, callback) {
  datastore.get(
    getKey(userId), 
    callback
  );

}
// [END get_cart]


module.exports = {
  upsertCart: upsertCart,
  getCart: getCart
}