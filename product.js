var _ = require('underscore');

var Customer = require('./customer.js');
var Feature = require('./feature.js');

function Product(product) {
  var customers = this.customers = [];
  if (product.customers) {
    product.customers.forEach(function(customer) {
      customers.push(new Customer(customer));
    });
  }

  this.price = product.price;

  var features = this.features = [];
  if (product.features) {
    product.features.forEach(function(feature) {
      features.push(new Feature(feature));
    });
  }
}

Product.prototype.getWIPFeatures = function() {
  return _.filter(this.features, function(feature) { return !feature.live; });
};

Product.prototype.launchFeature = function(wipIndex) {
  this.getWIPFeatures()[wipIndex].live = true;
};

Product.prototype.addFeature = function(name, performance, utility) {
  this.features.push(new Feature({
    name: name,
    performance: performance,
    utility: utility
  }));
};

module.exports = Product;
