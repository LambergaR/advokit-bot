var fs = require('fs');
var cat = JSON.parse(fs.readFileSync('products.json', 'utf8'));

var productById = function(id) {
	for(var i=0; i<cat.length; i++) {
		if(cat[i].productId == id) {
			return cat[i];
		}
	}
	return null;
}

module.exports = {
  productById: productById
}