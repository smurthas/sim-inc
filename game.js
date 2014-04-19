var readline = require('readline');

var async = require('async');

var Company = require('./company.js');
var Person = require('./person.js');
var Product = require('./product.js');
//var Customer = require('./customer.js');

var workOptions = [
  "Features",
  "Testing",
  "Bugs",
  "Performance"
];

var company = new Company(1000, [new Person()], new Product(10));

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
  // choose what to work on
  console.log('What do you want to work on?');
  for (var i in workOptions) {
    console.log('  ', [parseInt(i)+1,'.'].join(''), workOptions[i]);
  }
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(':', function(answer) {
    rl.close();
    console.error('answer', answer);
    var qualityWorkUnits = (parseInt(answer) > 1)? 1 : 0;
    // calc probabilities of events

    // determine whether events occured this cycle
    var numNewCustomers = getNumNewCustomers(company.product);
    var numChurnedCustomers = getNumChurnedCustomers(company.product);
    var qualityIncrease = getQualityIncrease(company.product, qualityWorkUnits);

    // update world
    company.product.customers += numNewCustomers - numChurnedCustomers;
    company.product.quality += qualityIncrease;
    var revenue = company.product.customers * company.product.price;
    company.cash += revenue;

    // display output
    console.log();
    console.log('## Customers ##');
    console.log('   New Customers:', numNewCustomers);
    console.log('  Lost Customers:', numChurnedCustomers);
    console.log(' Total Customers:', company.product.customers);
    console.log();
    console.log('## Product ##');
    console.log(' Product Quality:', Math.round(company.product.quality*10)/10);
    console.log();
    console.log('## P&L ##');
    console.log('         Revenue:', revenue);
    console.log('            Cash:', company.cash);
    console.log();

    callback();
  });
});
