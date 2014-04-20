var readline = require('readline');
var terminalMenu = require('terminal-menu');
var _ = require('underscore');

var workOptions = [
  {
    pretty: "Add a feature",
    code: 'addFeature',
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

function doMenu(title, options, callback) {
  console.error('options', options);
  var width = title.length;
  options.forEach(function(opt) {
    if (opt.length > width) width = opt.length;
  });

  var menu = terminalMenu({
    width: width,
  });

  menu.reset();

  menu.write(title);
  menu.write('\n');
  menu.write('\n');

  options.forEach(function(opt) {menu.add(opt);});

  menu.on('select', function(label, index) {
    menu.close();
    callback(index);
  });

  menu.createStream().pipe(process.stdout);
}

module.exports.getInput = function(callback) {
  doMenu('What do you want to work on?', _.pluck(workOptions, 'pretty'), callback);
  //for (var i in workOptions) {
  //  console.log('  ', [parseInt(i)+1,'.'].join(''), workOptions[i].pretty);
  //}
  //var rl = readline.createInterface({
  //  input: process.stdin,
  //  output: process.stdout
  //});

  //rl.question(':', function(answer) {
  //  answer = parseInt(answer);
  //  rl.close();
  //  var code = workOptions[answer-1].code;
  //  if (code === 'improveTooling' || code === 'addFeature') {
  //    return callback(null, code);
  //  }

  //});

};

module.exports.updateUI = function(sim, callback) {
  // display output
  console.log();
  console.log('## Customers ##');
  console.log('   New Customers:', sim.numNewCustomers);
  console.log('  Lost Customers:', sim.numChurnedCustomers);
  console.log(' Total Customers:', sim.company.product.customers);
  console.log();
  console.log('## Product ##');
  console.log('         Quality:', Math.round(sim.company.product.quality*10)/10);
  console.log();
  console.log('## P&L ##');
  console.log('         Revenue:', sim.revenue);
  console.log('            Cash:', sim.company.cash);
  console.log();

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('ok?', function() {
    rl.close();
    callback();
  });
};
