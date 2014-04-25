var fs = require('fs');

var Sim = require('./sim.js');

module.exports.load = function(path) {
  return new Sim(JSON.parse(fs.readFileSync(path).toString()));
};

module.exports.save = function(path, sim) {
  fs.writeFileSync(path, JSON.stringify(sim, 2, 2));
};
