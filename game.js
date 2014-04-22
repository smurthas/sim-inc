var async = require('async');

var ui = require('./ui.js');

var Company = require('./company.js');
var Person = require('./person.js');
var Product = require('./product.js');
//var Feature = require('./feature.js');
var Customer = require('./customer.js');



function getQuantityPossible(price) {
  return 1000/price;
}

function getNewAwareness(numCustomers, totalAddressable) {
  if (numCustomers >= totalAddressable) return 0;
  var possible = totalAddressable - numCustomers;
  if (possible > 10) possible = 10;
  return Math.round(Math.random() * possible);
}

function getProductValue(product) {
  var value = 0;

  product.features.forEach(function(feature) {
    if (!feature.live) return;
    var featureValue = feature.performance * feature.utility;
    if (feature.bugs > 10) featureValue = 0;
    else featureValue *= (10 - feature.bugs)/10;
    value += featureValue;
  });

  return value;
}

function getNumNewCustomers(product) {
  var totalNew = 0;

  var value = getProductValue(product);
  var totalAddressable = getQuantityPossible(product.price) * value;
  var possibleNew = getNewAwareness(product.customers.length, totalAddressable);

  console.error('value', value);
  console.error('totalAddressable', totalAddressable);
  console.error('possibleNew', possibleNew);

  for (var i = 0; i < possibleNew; i++) {
    var valueMultiplier = 0.5 + Math.random();
    if (valueMultiplier * value > product.price) totalNew++;
  }


  console.error('totalNew', totalNew);
  return totalNew;
}


function getNumChurnedCustomers(product) {
  if (product.quality < 3) return 4;
  if (product.quality > 8) return 0;
  return 2;
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

var sim = {
  company: new Company(1000, [new Person('Founder #1')], new Product(10)),
  week: 0
};

async.whilst(function() { return true; }, function(callback) {
  sim.week++;

  // choose what to work on
  ui.getInput(sim, function() {

    // calc probabilities of events

    // determine whether events occured this cycle
    sim.company.product.numNewCustomers =
      getNumNewCustomers(sim.company.product);
    sim.company.product.numChurnedCustomers =
      getNumChurnedCustomers(sim.company.product);


    // update world based on employee work
    sim.company.people.forEach(function(employee) {
      if (employee.task) doEmployeeWork(employee);
    });

    // handle random events

    // Add customers
    for (var i = 0; i < sim.company.product.numNewCustomers; i++) {
      sim.company.product.customers.push(new Customer());
    }
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
