function Customer(usingFeatures, demand) {
  this.demand = demand;
  this.usingFeatures = usingFeatures || [];
}

module.exports = Customer;
