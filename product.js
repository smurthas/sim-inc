function Product(price) {
  this.customers = [];
  this.price = price;
  this.features = [];
  this.wipFeatures = [];
  this.demand = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}


module.exports = Product;
