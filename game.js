var async = require('async');

var ui = require('./ui.js');

var Company = require('./company.js');
var Person = require('./person.js');
var Product = require('./product.js');
var Feature = require('./feature.js');
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

var sim = {
  company: new Company(1000, [new Person()], new Product(10)),
  week: 0
};

async.whilst(function() { return true; }, function(callback) {
  sim.week++;

  // choose what to work on
  ui.getInput(sim, function(eventCode, resp) {

    // calc probabilities of events

    // determine whether events occured this cycle
    sim.company.product.numNewCustomers =
      getNumNewCustomers(sim.company.product);
    sim.company.product.numChurnedCustomers =
      getNumChurnedCustomers(sim.company.product);


    // update world

    // handle user work choice
    if (eventCode === 'addFeature') {
      // add a feature
      var performance = Math.random() * 3;
      var utility = Math.random() * 3;
      sim.company.product.features.push(new Feature(resp, performance, utility));
    } else if (eventCode === 'launchFeature') {
      sim.company.product.launchFeature(resp);
    } else if (eventCode === 'improveFeature') {
      var feature = sim.company.product.features[resp];
      feature.performance += Math.random();
      feature.utility += Math.random();
    }

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
    ui.updateUI(sim, callback);
  });
});
