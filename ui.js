var util = require('util');
var EventEmitter = require('events').EventEmitter;
var readline = require('readline');

var terminalMenu = require('terminal-menu');
var hireMenu = require('./hireMenu.js');
var charm;
var _ = require('underscore');

function createCharm() {
  charm = require('charm')(process.stdout);
}

var workOptions = [
  {
    pretty: 'Add a feature',
    code: 'addFeature',
    prettyVerb: 'adding a new feature called'
  },
  {
    pretty: 'Improve functionality of a feature',
    code: 'improveFeature',
    prettyVerb: 'improving the functionality of'
  },
  {
    pretty: 'Improve performance of a feature',
    code: 'improvePerformance',
    prettyVerb: 'improving the performance of'
  },
  {
    pretty: 'Reduce the cost of a feature',
    code: 'reduceCost',
    prettyVerb: 'reducing the cost of'
  },
  {
    pretty: 'Fix Bugs',
    code: 'fixBugs',
    prettyVerb: 'fixing bugs in'
  },
  {
    pretty: 'Write Tests',
    code: 'writeTests',
    prettyVerb: 'writing tests for'
  },
  {
    pretty: 'Hiring',
    code: 'hiring',
    prettyVerb: 'recruiting candidates'
  }
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
    bg: 'black',
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

/*function doAddFeatureMenu(sim, callback) {
  console.log('Add a feature');
  prompt('What do you want to call this feature?', function(name) {
    var performance = Math.random() * 3;
    var utility = Math.random() * 3;
    sim.company.product.addFeature(name, performance, utility);
    return callback(name);
  });
}*/

function doSetPrice(sim, callback) {
  console.log('Current Price:', sim.company.product.price);
  prompt('How much do you want to charge?', function(priceStr) {
    sim.company.product.price = parseInt(priceStr.replace(/[^0-9.]/g, ''));
    return callback();
  });
}

function doLaunchFeatureMenu(sim, callback) {
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

function doChooseFeatureMenu(sim, callback) {
  var featureNames = _.pluck(sim.company.product.features, 'name');
  featureNames.push('Go back');
  doMenu('Which feature?', featureNames, function(featureIndex) {
    if (featureIndex === featureNames.length - 1) return callback();
    callback(featureIndex);
  });
}

function getParttimeEmployees(sim) {
  return _.filter(sim.company.people, function(person) {
    return person.salary < 1;
  });
}

function doGoFulltime(sim, callback) {
  var nonFulltime = getParttimeEmployees(sim);
  var names = _.pluck(nonFulltime, 'name');
  names.push('Go Back');
  doMenu('Which employee?', names, function(index) {
    var employee = nonFulltime[index];
    if (!employee) return callback();
    sim.makeEmployeeFulltime(employee);
    if (getParttimeEmployees(sim).length === 0) {
      topOptions = _.reject(topOptions, function(item) {
        return item.code === 'fulltime';
      });
    }
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
      currentJob += workOption.prettyVerb;
      var feature = sim.company.product.features[employee.task.feature];
      if (feature) currentJob += ' ' + feature.name;
      else currentJob += '.';
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
        case 'hiring':
          employee.task = { code: code };
          callback();
          break;

        default:
          doChooseFeatureMenu(sim, function(featureIndex) {
            if (featureIndex >= 0) {
              employee.task = {
                code: code,
                feature: featureIndex
              };
            }
            callback();
          });
      }
    });
  });
}

function round(num, digits) {
  if (typeof digits !== 'number' || digits < 1) return Math.round(num);
  return Math.round(num * Math.pow(10, digits))/Math.pow(10, digits);
}

function printHeader(row, title) {
  charm.position(2, row);
  charm.display('underscore');
  charm.write('## ' + title + ' ##');
  charm.display('reset');
}

function printSubheader(row, title) {
  charm.position(4, row);
  charm.write('# ' + title + ' #');
}

function printMetric(row, name, value, digits, scale) {
  scale = scale || 1;
  charm.position(18 - name.length, row);
  charm.write(name + ': ');
  charm.write('' + round(scale * value, digits));
}

function printMetrics(sim) {
  charm.display('reset');
  charm.reset();

  var i = 4;
  charm.position(2, 2);
  charm.write('Week ' + sim.week);
  printHeader(i++, 'Customers');
  printMetric(i++, 'New Customers', sim.company.product.newCustomers.length);
  printMetric(i++, 'Churned Customers', sim.company.product.churnedCustomers.length);
  printMetric(i++, 'Total Customers', sim.company.product.customers.length);
  i++;
  printHeader(i++, 'Product');
  sim.company.product.features.forEach(function(feature) {
    printSubheader(i++, feature.name);
    printMetric(i++, 'Utility', feature.utility, 1);
    printMetric(i++, 'Performance', feature.performance, 1);
    printMetric(i++, 'Bugs', feature.bugs, 0);
    printMetric(i++, 'Bugs Squashed', feature.squashedBugs, 0);
    printMetric(i++, 'New Bugs', feature.newBugs, 0);
    printMetric(i++, 'Tests', feature.tests, 0);
    printMetric(i++, 'COGS', feature.COGS, 2);
    i++;
  });
  printHeader(i++, 'People');
  sim.company.people.forEach(function(person) {
    printSubheader(i++, person.name);
    printMetric(i++, 'Salary', person.salary, 0);
    printMetric(i++, 'Speed', person.traits.speed, 2, 10);
    printMetric(i++, 'Consistence', person.traits.consistency, 2, 10);
    printMetric(i++, 'Diligence', person.traits.diligence, 2, 10);
  });
  i++;
  printHeader(i++, 'P&L');
  printMetric(i++, 'Total Revenue', sim.company.revenue, 2);
  printMetric(i++, 'Total COGS', sim.company.COGS, 2);
  printMetric(i++, 'Payroll', sim.company.payroll, 2);
  printMetric(i++, 'Profit', sim.company.profit, 2);
  printMetric(i++, 'Cash', sim.company.cash, 2);
}


function doPrintMetrics(sim, callback) {
  printMetrics(sim);

  prompt('Ok?', function() {
    callback();
  });
}

var topOptions = [
  {
    pretty: 'Manage Employee Work',
    code: 'employeeWork',
    onSelect: doManageWorkMenu
  },
  {
    pretty: 'See Metrics',
    code: 'seeMetrics',
    onSelect: doPrintMetrics
  },
  {
    pretty: 'Launch a Feature',
    code: 'launchFeature',
    onSelect: doLaunchFeatureMenu
  },
  {
    pretty: 'Go fulltime',
    code: 'fulltime',
    onSelect: doGoFulltime
  },
  {
    pretty: 'Hire a new Employee',
    code: 'hire',
    onSelect: hireMenu.doHireMenu
  },
  {
    pretty: 'Set Product Price',
    code: 'setPrice',
    onSelect: doSetPrice
  },
  {
    pretty: 'Done',
    code: 'done'
  }
];


// Class definition
function TerminalUI(sim) {
  this.sim = sim;
  var self = this;
  self._onData = function(buf) {
    self._handleCharmData(buf);
  };
  createCharm();

  process.stdin.on('data', self._onData);
  process.stdin.setRawMode(true);
  process.stdin.resume();
}


util.inherits(TerminalUI, EventEmitter);

TerminalUI.prototype._handleCharmData = function(data) {
  var self = this;
  if (data && data.toString() === 'p') {
    if (self.sim.paused) {
      self.sim.paused = false;
      self.emit('unpause');
    } else {
      self.sim.paused = true;
      self.emit('pause');
      process.stdin.removeListener('data', self._onData);
      self.getInput(self.sim, function() {
        charm.display('reset');
        charm.reset();
        process.stdin.on('data', self._onData);
        process.stdin.setRawMode(true);
        process.stdin.resume();

        printMetrics(self.sim);
        self.sim.paused = false;
        self.emit('unpause');
      });
    }
  }
};

TerminalUI.prototype.getInput = function(sim, callback) {
  var self = this.getInput.bind(this, sim, callback);
  var titles = ['Week ' + sim.week];
  var options = _.pluck(topOptions, 'pretty');
  doMenu(titles, options, function(index) {
    var option = topOptions[index];
    if (option.onSelect instanceof Function) return option.onSelect(sim, self);
    callback();
  });
};

TerminalUI.prototype.updateUI = function(sim, callback) {
  // display output
  printMetrics(sim);

  callback();
};

TerminalUI.prototype.round = round;


// module definition
module.exports.TerminalUI = TerminalUI;
