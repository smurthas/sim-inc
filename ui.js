var readline = require('readline');
var terminalMenu = require('terminal-menu');
var _ = require('underscore');

var workOptions = [
  {
    pretty: 'Manage Employee Work',
    code: 'employeeWork'
  },
  {
    pretty: "Add a feature",
    code: 'addFeature',
  },
  {
    pretty: "Launch a feature",
    code: 'launchFeature',
  },
  {
    pretty: "Improve a feature",
    code: 'improveFeature',
  },
  {
    pretty: "Fix Bugs",
    code: 'fixBugs',
  },
  {
    pretty: "Improve Performance",
    code: 'improvePerformance',
  },
  {
    pretty: "Improve Tooling",
    code: 'improveTooling',
  },
  //{
  //  pretty: "Hiring",
  //  code: 'hiring',
  //}
];

function doMenu(titles, options, callback) {
  if (!(titles instanceof Array)) titles = [titles];
  var width = titles[0].length;
  titles.forEach(function(title) {
    if (title.length > width) width = title.length;
  });
  options.forEach(function(opt) {
    if (opt.length > width) width = opt.length;
  });

  var menu = terminalMenu({
    width: width,
  });

  menu.reset();

  titles.forEach(function(title) {
    menu.write(title);
    menu.write('\n');
  });
  menu.write('\n');

  options.forEach(function(opt) {menu.add(opt);});

  menu.on('select', function(label, index) {
    menu.close();
    callback(index);
  });

  menu.createStream().pipe(process.stdout);
}

function prompt(question, callback) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(question, function(answer) {
    rl.close();
    callback(answer);
  });
}

function doAddFeatureMenu(callback) {
  console.log('Add a feature');
  prompt('What do you want to call this feature?', function(name) {
    console.error('name', name);
    return callback(name);
  });
}

function doLaunchFeatureMenu(sim, callback) {
  console.error('sim.company.product.features', sim.company.product.features);
  console.log('Launch a feature');
  var wipFeatureNames = _.pluck(sim.company.product.getWIPFeatures(), 'name');
  doMenu('Launch which feature?', wipFeatureNames, callback);
}

function doImproveFeatureMenu(sim, callback) {
  console.error('sim.company.product.features', sim.company.product.features);
  console.log('Improve a feature');
  var featureNames = _.pluck(sim.company.product.features, 'name');
  doMenu('Improve which feature?', featureNames, callback);
}

module.exports.getInput = function(sim, callback) {
  var titles = ['Week ' + sim.week, 'What do you want to work on?'];
  var options = _.pluck(workOptions, 'pretty');
  doMenu(titles, options, function(index) {
    var code = workOptions[index].code;
    callback = callback.bind(this, code);

    switch(code) {
      case 'employeeWork':
        //doManageEmployeeWork(sim, callback);
        break;

      case 'addFeature':
        doAddFeatureMenu(callback);
        break;

      case 'launchFeature':
        doLaunchFeatureMenu(sim, callback);
        break;

      case 'improveFeature':
        doImproveFeatureMenu(sim, callback);
        break;

      default:
        return callback(code);
    }
  });
};

module.exports.updateUI = function(sim, callback) {
  // display output
  console.log();
  console.log('## Customers ##');
  console.log('   New Customers:', sim.company.product.numNewCustomers);
  console.log('  Lost Customers:', sim.company.product.numChurnedCustomers);
  console.log(' Total Customers:', sim.company.product.customers.length);
  console.log();
  console.log('## Product ##');
  console.log('         Quality:', Math.round(sim.company.product.quality*10)/10);
  console.log();
  console.log('## P&L ##');
  console.log('         Revenue:', sim.company.revenue);
  console.log('            Cash:', sim.company.cash);
  console.log();

  //console.error('sim.company', sim.company);
  console.error('sim.company.product', sim.company.product);

  prompt('ok?', callback);
};
