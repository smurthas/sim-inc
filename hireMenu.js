var _ = require('underscore');
var terminalMenu = require('terminal-menu');


function calcWidth() {
  var items = _.flatten(arguments);
  if (!items || items.length === 0) return 0;
  var width = items[0].length;
  items.forEach(function(item) {
    if (item.length > width) width = item.length;
  });

  return width;
}

function doDetailMenu(options, callback) {
  var titles = options.title;
  var width = calcWidth(titles, _.pluck(options.items, 'pretty'));

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

  options.items.forEach(function(item) {
    menu.add(item.pretty);
    if (item.info) {
      for(var key in item.info) {
        menu.write('  ' + key + ': ' + item.info[key] + '\n');
      }
      menu.write('\n');
    }
  });

  menu.on('select', function(label, index) {
    menu.close();
    if (index === (options.items.length-1)) return callback();
    var item = options.items[index];
    if (item && (item.onSelect instanceof Function)) {
      return options.items[index].onSelect(index, callback);
    }
    callback(item, index);
  });

  menu.createStream().pipe(process.stdout);
}


module.exports.doHireMenu = function(sim, callback) {
  var candidates = [];
  for (var i in sim.company.candidates) {
    var c = sim.company.candidates[i];
    var candidate = {
      pretty: c.name,
      info: {
        Name: c.name,
        Speed: c.traits.speed,
        Consistency: c.traits.consistency,
        Diligence: c.traits.diligence,
        Salary: c.salary
      }
    };
    candidates.push(candidate);
  }

  candidates.push({
    pretty: 'Go back'
  });
  var options = {
    title: ['Hire an Employee'],
    items: candidates
  };
  doDetailMenu(options, function(item, index) {
    if (typeof index === 'number') sim.hireCandidate(index);
    callback();
  });
};
