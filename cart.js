var logging = require('./lib/logging')();
var catalogue = require('./catalogue');
var cartService = require('./cart-service');

// var cartContainer = [];

/*
	cart:
	{
		userId: <user_id>,
		total: <total value of the elements in the cart>,

		products: [
			{
				productId: <product_id>,
				count: <count>
			}
		]
	}

	product:
	{
		title: <name of the product>, 
    subtitle: <description of the product>,
    imageUrl: <image url>,
    originUrl: <original website url>,
    productId: <id>,
    price: <decimal>

    }
*/

function log(value) {
  logging.info("ADVOKIT-BOT: " + value);
}

var addToCart = function(userId, productId, callback) {
	log("addToCart");

	getCart(userId, function(err, cart) {
		if(err) {
			
			if(callback) {
				callback(err, null);
			}  else {
				log(err);
			}

			return;
		}

		var product = catalogue.productById(productId);

		if(cart && product) {
			cart.total = cart.total + product.price;

			for(var i=0; i<cart.products.length; i++) {
				if(cart.products[i].productId == productId) {
					
					log("-> existing product, increasing count");

					cart.products[i].count = cart.products[i].count + 1;

					log(JSON.stringify(cart))
					cartService.upsertCart(cart, callback);
					
					return;
				}
			}

			log("-> new product");

			cart.products.push({productId: productId, count: 1});

			cartService.upsertCart(cart, callback);
			log(JSON.stringify(cart))
		}

	});
	
}

var removeFromCart = function(userId, productId, callback) {
	log("removeFromCart");

	getCart(userId, function(err, cart) {
		if(err) {
			callback(err);
			return;
		}

		var product = catalogue.productById(productId);

		if(cart && product) {
			var cartProduct = null;
			var index = -1;
			for(var i=0; i<cart.products.length; i++) {
				if(cart.products[i].productId == productId) {

					log("-> found product with id " + productId + " in the cart")

					cartProduct = cart.products[i];
					index = i;

					break;
				}
			}

			if(cartProduct && index <= 0) {
				log("-> removing from cart");

				cart.products.splice(index, 1);	
				cart.total = cart.total - product.price;
			}

			cartService.upsertCart(cart, function(err) {
				if(err) {
					log(err);
					callback(err);
				} else {
					log(JSON.stringify(cart));
					callback(null);
				}
			});
		}	
	});
}

var getCart = function(userId, callback) {
	log("getCart");
 	cartService.getCart(userId, function(err, cart) {
 		if(err) {
 			log("Error fetching cart");
			log(err);

			if(callback) {
				callback(err, null);	
			}

 		} else {
 			log("Retrieved cart: ");
			log(JSON.stringify(cart));

			var extractedCart = {userId: userId, products: [], total: 0};

			if(!cart) {
				log("Creating a new cart");

				cartService.upsertCart(extractedCart, function(err) {});
			} else {
				if(cart.data) {
					extractedCart = cart.data;
				}
			}

			if(callback) {
				callback(null, extractedCart);	
			}
 		}
 	});
}

module.exports = {
  addToCart: addToCart,
  removeFromCart: removeFromCart,
  getCart: getCart
}