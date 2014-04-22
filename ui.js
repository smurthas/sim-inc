var readline = require('readline');
var terminalMenu = require('terminal-menu');
var _ = require('underscore');

var workOptions = [
  {
    pretty: "Add a feature",
    code: 'addFeature',
    prettyVerb: 'adding a new feature called'
  },
  {
    pretty: "Improve functionality of a feature",
    code: 'improveFeature',
    prettyVerb: 'improving the functionality of'
  },
  {
    pretty: "Fix Bugs",
    code: 'fixBugs',
    prettyVerb: 'fixing bugs in'
  },
  {
    pretty: "Improve performance of a feature",
    code: 'improvePerformance',
    prettyVerb: 'improving the performance of'
  },
  //{
  //  pretty: "Improve Tooling",
  //  code: 'improveTooling',
  //},
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
    fg: 15,
    bg: 'black'
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

  rl.question(question + ' ', function(answer) {
    rl.close();
    callback(answer);
  });
}

function doAddFeatureMenu(sim, callback) {
  console.log('Add a feature');
  prompt('What do you want to call this feature?', function(name) {
    console.error('name', name);
    var performance = Math.random() * 3;
    var utility = Math.random() * 3;
    sim.company.product.addFeature(name, performance, utility);
    return callback(name);
  });
}

function doLaunchFeatureMenu(sim, callback) {
  console.error('sim.company.product.features', sim.company.product.features);
  console.log('Launch a feature');
  var wipFeatureNames = _.pluck(sim.company.product.getWIPFeatures(), 'name');
  wipFeatureNames.push('Go back');
  doMenu('Launch which feature?', wipFeatureNames, function(featureIndex) {
    if (featureIndex === wipFeatureNames.length - 1) return callback();
    sim.company.product.launchFeature(featureIndex);
    callback();
  });
}

function doChooseEmployeeMenu(sim, callback) {
  var names = _.pluck(sim.company.people, 'name');
  names.push('Go Back');
  doMenu('Which employee?', names, function(index) {
    callback(sim.company.people[index]);
  });
}

function doSetTaskMenu(employee, taskCode, sim, callback) {
  console.error('employee', employee);
  console.error('code', taskCode);
  console.error('sim', sim);
  if (!employee) return callback();
  var featureNames = _.pluck(sim.company.product.features, 'name');
  console.error('featureNames', featureNames);
        //process.exit(1);
  featureNames.push('Go back');
  doMenu('Which feature?', featureNames, function(featureIndex) {
    if (featureIndex === featureIndex.length - 1) return callback();
    var feature = sim.company.product.features[featureIndex];
    employee.task = {
      code: taskCode,
      feature: feature
    };
    callback();
  });
}

function doManageWorkMenu(sim, callback) {
  doChooseEmployeeMenu(sim, function(employee) {
    if (!employee) return callback();
    var titles = ['Week ' + sim.week, ''];
    var currentJob = employee.name + ' is working on ';
    if (!employee.task) currentJob += 'nothing.';
    else {
      var workOption = _.find(workOptions,
        function(option) { return option.code === employee.task.code; });
      currentJob += workOption.prettyVerb + ' ' + employee.task.feature.name;
    }
    titles.push(currentJob);
    titles.push('What would you like ' + employee.name + ' to work on?');
    var options = _.pluck(workOptions, 'pretty');
    options.push('Go back');
    doMenu(titles, options, function(index) {
      if (index > workOptions.length - 1) return doManageWorkMenu(sim, callback);
      var code = workOptions[index].code;

      switch(code) {
        case 'addFeature':
          doAddFeatureMenu(sim, callback);
          break;

        default:
          doSetTaskMenu(employee, code, sim, callback);
          //return callback(code);
      }
    });
  });
}

var topOptions = [
  {
    pretty: 'Manage Employee Work',
    code: 'employeeWork'
  },
  {
    pretty: 'See Metrics',
    code: 'seeMetrics',
  },
  {
    pretty: "Launch a feature",
    code: 'launchFeature',
  },
  {
    pretty: 'Done',
    code: 'done'
  }
];


module.exports.getInput = function(sim, callback) {
  var self = module.exports.getInput.bind(this, sim, callback);
  var titles = ['Week ' + sim.week];
  var options = _.pluck(topOptions, 'pretty');
  doMenu(titles, options, function(index) {
    var code = topOptions[index].code;

    switch(code) {
      case 'launchFeature':
        doLaunchFeatureMenu(sim, self);
        break;

      case 'employeeWork':
        doManageWorkMenu(sim, self);
        break;

      case 'done':
        callback();
        break;

      default:
        return self();
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
  console.error('sim.company.product', _.omit(sim.company.product, 'customers'));

  prompt('ok?', callback);
};
