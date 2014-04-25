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
  feature.utility += progress;
}

function doImprovePerformance(feature, person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var progress = Stats.gaussRandom() * stdDev + mu;
  feature.performance += progress;
}

function doFixBugs(feature, person) {
  var lambda = person.traits.diligence * person.traits.speed * 10;
  var bugsSquashed = Stats.poissonRandom(lambda);
  if (bugsSquashed > feature.bugs) bugsSquashed = feature.bugs;
  feature.bugs -= bugsSquashed;
  feature.squashedBugs = bugsSquashed;
}

function doWriteTests(feature, person) {
  var lambda = person.traits.diligence * person.traits.speed * 10;
  var newTests = Stats.poissonRandom(lambda);
  feature.tests += newTests;
  feature.newTests = newTests;
}

Sim.prototype._doWork = function() {
  var product = this.company.product;
  this.company.people.forEach(function(person) {
    var feature = product.features[person.task.feature];
    switch(person.task.code) {
      case 'improveFeature':
        doImproveUtility(feature, person);
        break;
      case 'fixBugs':
        doFixBugs(feature, person);
        break;
      case 'writeTests':
        doWriteTests(feature, person);
        break;
      case 'improvePerformance':
        doImprovePerformance(feature, person);
        break;
      default:
        throw new Error('unsupported task code' + person.task.code);
    }
  });
};

Sim.prototype._doGenerateBugs = function() {
  var features = this.company.product.features;
  features.forEach(function(feature) {
    var lambda = feature.performance * feature.utility / (feature.tests + 1);
    var newBugs = Math.max(0, Stats.poissonRandom(lambda) - 1);
    feature.bugs += newBugs;
    feature.newBugs = newBugs;
  });
};

// "public" functions

Sim.prototype.updateWorld = function() {
  // update world based on work
  this._doWork();

  // handle random events

  // Add customers
  this.company.product.newCustomers = this._doNewCustomers();

  // churn customers
  this.company.product.churnedCustomers = this._doChurnCustomers();

  // generate bugs
  this._doGenerateBugs();

  this.company.revenue =
    this.company.product.customers.length * this.company.product.price;
  this.company.cash += this.company.revenue;
};


module.exports = Sim;
