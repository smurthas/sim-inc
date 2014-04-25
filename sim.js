var _ = require('underscore');

var Company = require('./company.js');
//var Person = require('./person.js');
//var Product = require('./product.js');
var Customer = require('./customer.js');

var Stats = require('./stats.js');

// helper functions

function getValue(features) {
  var value = 0;

  features.forEach(function(feature) {
    if (!feature.live) return;
    var featureValue = feature.performance * feature.utility / 10;
    if (feature.bugs > 10) featureValue = 0;
    else featureValue *= (10 - feature.bugs)/10;
    value += featureValue;
  });

  return value;
}


var STARTER = {
  version: 1,
  company: {
    cash: 1000,
    people: [
      {
        name: 'Founder #1'
      },
      {
        name: 'Founder #2'
      }
    ],
    product: {
      price: 10
    }
  },
  week: 0
};

// Sim Class definition
function Sim(selfie) {
  if (!selfie) selfie = STARTER;

  this.version = selfie.version;
  this.company = new Company(selfie.company);
  this.week = selfie.week;
}

// "private" functions

Sim.prototype._doNewCustomers = function() {
  var product = this.company.product;
  var WOM = (4 + (product.customers.length * 0.06)) * (0.5 + Math.random());
  WOM = Math.round(WOM);

  var newCustomers = [];
  var value = getValue(product.features);
  for (var i = 0; i < WOM; i++) {
    var demand = 0.5 + Math.random();
    var customerValue = demand * value;
    var p_signup = Math.pow(0.8, Math.pow(product.price/customerValue, 3));
    if (Math.random() < p_signup) {
      var customer = new Customer(_.initial(product.features, 0), demand);
      product.customers.push(customer);
      newCustomers.push(customer);
    }
  }

  product.customers = _.union(product.customers, newCustomers);

  return newCustomers;
};

Sim.prototype._doChurnCustomers = function() {
  var product = this.company.product;
  var customers = product.customers;
  var keptCustomers = [];
  customers.forEach(function(customer) {
    var customerValue = getValue(customer.usingFeatures) * customer.demand;
    var p_retain = Math.pow(0.7, Math.pow(product.price/customerValue, 5));
    if (Math.random() < p_retain) keptCustomers.push(customer);
  });

  var churned = _.difference(customers, keptCustomers);
  product.customers = keptCustomers;
  return churned;
};

function doImproveUtility(feature, person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var progress = Stats.gaussRandom() * stdDev + mu;
  feature.performance += progress;
}

function doImprovePerformance(feature, person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var progress = Stats.gaussRandom() * stdDev + mu;
  feature.performance += progress;
}

Sim.prototype._doEmployeeWork = function() {
  var product = this.company.product;
  this.company.people.forEach(function(employee) {
    var feature = product.features[employee.task.feature];
    switch(employee.task.code) {
      case 'improveFeature':
        doImproveUtility(feature, employee);
        break;
      case 'fixBugs':
        var bugsRemoved = 1;
        feature.bugs = Math.max(0, feature.bugs - bugsRemoved);
        break;
      case 'improvePerformance':
        doImprovePerformance(feature, employee);
        break;
      default:
        throw new Error('unsupported task code' + employee.task.code);
    }
  });
};


// "public" functions

Sim.prototype.updateWorld = function() {
  // update world based on employee work
  this._doEmployeeWork();

  // handle random events

  // Add customers
  this.company.product.newCustomers = this._doNewCustomers();

  // churn customers
  this.company.product.churnedCustomers = this._doChurnCustomers();

  this.company.revenue =
    this.company.product.customers.length * this.company.product.price;
  this.company.cash += this.company.revenue;
};


module.exports = Sim;
