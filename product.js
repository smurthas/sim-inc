var _ = require('underscore');

var Feature = require('./feature.js');

function Product(price) {
  this.customers = [];
  this.price = price;
  this.features = [];
  this.demand = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

Product.prototype.getWIPFeatures = function() {
  return _.filter(this.features, function(feature) { return !feature.live; });
};

Product.prototype.launchFeature = function(wipIndex) {
  this.getWIPFeatures()[wipIndex].live = true;
};

Product.prototype.addFeature = function(name, performance, utility) {
  this.features.push(new Feature(name, performance, utility));
};

module.exports = Product;
