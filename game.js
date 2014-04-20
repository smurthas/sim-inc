var async = require('async');

var ui = require('./ui.js');

var Company = require('./company.js');
var Person = require('./person.js');
var Product = require('./product.js');
//var Customer = require('./customer.js');



function getQualityIncrease(product, workUnits) {
  var remaining = 10 - product.quality;
  var increase = remaining - (remaining * 3/(workUnits+3));
  return increase;
}

function getNumNewCustomers(product) {
  if (product.quality > 8) return 4;
  if (product.quality < 5) return 1;
  return 3;
}

function getNumChurnedCustomers(product) {
  if (product.quality < 3) return 4;
  if (product.quality > 8) return 0;
  return 2;
}

async.whilst(function() { return true; }, function(callback) {
  var sim = {
    company: new Company(1000, [new Person()], new Product(10))
  };
  // choose what to work on
  ui.getInput(function(answer) {
    var qualityWorkUnits = (answer > 1)? 1 : 0;

    // calc probabilities of events

    // determine whether events occured this cycle
    sim.company.product.numNewCustomers =
      getNumNewCustomers(sim.company.product);
    sim.company.product.numChurnedCustomers =
      getNumChurnedCustomers(sim.company.product);
    sim.company.product.qualityIncrease =
      getQualityIncrease(sim.company.product, qualityWorkUnits);

    // update world
    sim.company.product.customers +=
      sim.company.numNewCustomers - sim.company.numChurnedCustomers;
    sim.company.product.quality += sim.company.product.qualityIncrease;
    sim.company.revenue =
      sim.company.product.customers * sim.company.product.price;
    sim.company.cash += sim.company.revenue;

    // print the state of the world
    ui.updateUI(sim, callback);
  });
});
