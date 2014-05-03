var fs = require('fs');

var _ = require('underscore');

var Company = require('./company.js');
//var Person = require('./person.js');
//var Product = require('./product.js');
var Customer = require('./customer.js');
var Feature = require('./feature.js');

var Stats = require('./stats.js');

// helper functions

function getValue(features) {
  var value = 0;

  features.forEach(function(feature) {
    if (!feature.live) return;
    var featureValue = feature.performance * feature.utility / 10;
    if (feature.bugs > 1) featureValue *= 1/Math.pow(feature.bugs, 0.5);
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

var nouns = fs.readFileSync('nouns.txt').toString().split('\n');
var adjs = fs.readFileSync('adjectives.txt').toString().split('\n');
function doAddFeature(person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var utility = Stats.gaussRandom() * stdDev + mu;
  var performance = Stats.gaussRandom() * stdDev + mu;

  mu = utility * performance / 10;
  var COGS = Stats.gaussRandom() * stdDev + mu;
  var name = adjs[Math.floor(Math.random()*adjs.length)] + ' ' +
             nouns[Math.floor(Math.random()*nouns.length)];
  var feature = {
    name: name,
    performance: performance,
    utility: utility,
    COGS: COGS
  };
  return new Feature(feature);
}

function doImproveUtility(feature, person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var progress = Stats.gaussRandom() * stdDev + mu;
  feature.utility += progress;
  feature.rawCOGS += progress;
}

function doImprovePerformance(feature, person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var progress = Stats.gaussRandom() * stdDev + mu;
  feature.performance += progress;
  feature.rawCOGS += progress;
}

function doReduceCosts(feature, person) {
  var mu = person.traits.speed;
  var stdDev = 0.1/person.traits.consistency;
  var progress = Stats.gaussRandom() * stdDev + mu;
  feature.COGSReduction += progress;
}

function doFixBugs(feature, person) {
  var lambda = person.traits.diligence * person.traits.speed * 10;
  var bugsSquashed = Stats.poissonRandom(lambda);
  if (bugsSquashed > feature.bugs) bugsSquashed = feature.bugs;
  feature.bugs -= bugsSquashed;
  feature.squashedBugs = bugsSquashed;
}

function doWriteTests(feature, person) {
  var lambda = person.traits.diligence * person.traits.speed * 20;
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
      case 'reduceCost':
        doReduceCosts(feature, person);
        break;

      case 'addFeature':
        product.features.push(doAddFeature(person));
        break;
      default:
        throw new Error('unsupported task code' + person.task.code);
    }
  });
};

Sim.prototype._doGenerateBugs = function() {
  var features = this.company.product.features;
  features.forEach(function(feature) {
    var lambda = Math.log(feature.performance * feature.utility + 1) /
                  (feature.tests + 1);
    var newBugs = Math.max(0, Stats.poissonRandom(lambda) - 1);
    feature.bugs += newBugs;
    feature.newBugs = newBugs;
  });
};

Sim.prototype._doPnL = function() {
  var product = this.company.product;

  this.company.COGS = _.reduce(product.features, function(memo, feature) {
    feature.COGS = feature.rawCOGS / Math.pow(feature.COGSReduction, 0.5);
    return memo + feature.COGS;
  }, 0) * product.customers.length;

  this.company.revenue = product.customers.length * product.price;

  this.company.payroll = _.reduce(this.company.people, function(memo, person) {
    return memo + (person.salary || 0);
  }, 0);

  this.company.cash += this.company.revenue - this.company.COGS - this.company.payroll;
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

  this._doPnL();
};


module.exports = Sim;
