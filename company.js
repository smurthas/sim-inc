function Company(cash, founders, product) {
  this.cash = cash;
  this.founders = founders;
  this.people = [];
  this.founders.forEach(this.people.push.bind(this));
  this.product = product;
}

module.exports = Company;