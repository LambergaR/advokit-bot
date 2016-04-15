var logging = require('./lib/logging')();
var catalogue = require('./catalogue');

var cartContainer = [];

function log(value) {
  logging.info("ADVOKIT-BOT: " + value);
}

var addToCart = function(userId, productId) {
	var cart = getCart(userId);
	var product = catalogue.productById(productId);

	if(cart && product) {
		cart.total = cart.total + product.price;

		for(var i=0; i<cart.products.length; i++) {
			if(cart.products[i].productId == productId) {
				
				log("existing product, increasing count");

				cart.products[i].count = cart.products[i].count + 1;

				log(JSON.stringify(cart))

				return cart;
			}
		}

		log("new product");

		cart.products.push({productId: productId, count: 1});

		log(JSON.stringify(cart))
	}

	return cart;
}

var removeFromCart = function(userId, productId) {
	var cart = getCart(userId);
	var product = catalogue.productById(productId);

	if(cart && product) {
		var cartProduct = null;
		var index = -1;
		for(var i=0; i<cart.products.length; i++) {
			if(cart.products[i].productId == productId) {
				cartProduct = cart.products[i];
				index = i;
			}
		}

		if(cartProduct && index <= 0) {
			cart.products.splice(index, 1);	
			cart.total = cart.total - product.price;
		}
	}

	return cart;
}

var getCart = function(userId) {
  for(var i=0; i<cartContainer.length; i++) {
  	var cart = cartContainer[i];

  	if(cart.userId==userId) {
  		log("found existing cart for user " + userId);
  		log(JSON.stringify(cart))

  		return cart;
  	}
  }

	log("creating new cart for user " + userId);
  var cart = {userId: userId, products: [], total: 0};
  cartContainer.push(cart);

  return cart;
}

module.exports = {
  addToCart: addToCart,
  removeFromCart: removeFromCart,
  getCart: getCart
}