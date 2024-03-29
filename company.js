var Product = require('./product.js');
var Person = require('./person.js');

function Company(cash, founders, product) {
  if (typeof cash === 'number' &&
      founders instanceof Array &&
      product instanceof Product) {
    this.cash = cash;
    this.people = founders;
    this.product = product;
  } else {
    var company = cash;
    this.cash = company.cash;

    var people = this.people = [];
    company.people.forEach(function(person) {
      people.push(new Person(person));
    });

    var candidates = this.candidates = [];
    if(company.candidates) {
      company.candidates.forEach(function(candidate) {
        candidates.push(new Person(candidate));
      });
    }

    this.product = new Product(company.product);
  }
}

module.exports = Company;
