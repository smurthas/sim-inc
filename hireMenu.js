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
    options.items[index].onSelect(index, callback);
  });

  menu.createStream().pipe(process.stdout);
}


module.exports.doHireMenu = function(candidates, callback) {
  doDetailMenu(candidates, callback);
};
