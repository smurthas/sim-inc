function Company(cash, founders, product) {
  var self = this;
  this.cash = cash;
  this.founders = founders;
  this.people = [];
  this.founders.forEach(function(person) {
    self.people.push(person);
  });
  this.product = product;
}

module.exports = Company;
