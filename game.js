var argv = require('optimist').argv;
var async = require('async');

var files = require('./files.js');
var ui = require('./ui.js');
var Sim = require('./sim.js');

var sim;
if (argv.f) {
  sim = files.load(argv.f);
} else {
  sim = new Sim();
}

async.whilst(function() { return true; }, function(callback) {
  sim.week++;

  // choose what to work on
  ui.getInput(sim, function() {
    // update world based on employee work
    sim.updateWorld();

    // print the state of the world
    ui.updateUI(sim, function() {
      if (argv.o) files.save(argv.o, sim);
      callback();
    });
  });
});
