var async = require('async');
var _ = require('underscore');

var ui = require('./ui.js');

var Company = require('./company.js');
var Person = require('./person.js');
var Product = require('./product.js');
//var Feature = require('./feature.js');
var Customer = require('./customer.js');


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

function doNewCustomers(sim) {
  var product = sim.company.product;
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
}


function doChurnCustomers(sim) {
  var product = sim.company.product;
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
}

function doEmployeeWork(employee) {
  var feature = employee.task.feature;
  switch(employee.task.code) {
    case 'improveFeature':
      feature.utility += Math.random();
      break;
    case 'fixBugs':
      var bugsRemoved = 1;
      feature.bugs = Math.max(0, feature.bugs - bugsRemoved);
      break;
    case 'improvePerformance':
      feature.performance += Math.random();
      break;
    default:
      throw new Error('unsupported task code' + employee.task.code);
  }
}

var founders = [
  new Person('Founder #1'),
  new Person('Founder #2')
];
var sim = {
  version: 1,
  company: new Company(1000, founders, new Product(10)),
  week: 0
};

async.whilst(function() { return true; }, function(callback) {
  sim.week++;

  // choose what to work on
  ui.getInput(sim, function() {

    // calc probabilities of events

    // determine whether events occured this cycle


    // update world based on employee work
    sim.company.people.forEach(function(employee) {
      if (employee.task) doEmployeeWork(employee);
    });

    // handle random events

    // Add customers
    sim.company.product.newCustomers = doNewCustomers(sim);

    // churn customers
    sim.company.product.churnedCustomers = doChurnCustomers(sim);

    //sim.company.product.customers +=
    //  sim.company.numNewCustomers - sim.company.numChurnedCustomers;
    //sim.company.product.quality += sim.company.product.qualityIncrease;
    sim.company.revenue =
      sim.company.product.customers.length * sim.company.product.price;
    sim.company.cash += sim.company.revenue;

    // print the state of the world
    ui.updateUI(sim, function() {
      callback();
    });
  });
});
