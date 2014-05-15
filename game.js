var argv = require('optimist').argv;

var files = require('./files.js');
var TerminalUI = require('./ui.js').TerminalUI;
var Sim = require('./sim.js');

var weekTime = argv.t || 10000;

var sim;
if (argv.f) {
  sim = files.load(argv.f);
} else {
  sim = new Sim();
}

var ui = new TerminalUI(sim);

var timeoutTime = 10000;
function doCalc() {
  sim.week++;

  // update world based on employee work
  sim.updateWorld();

  // print the state of the world
  ui.updateUI(sim, function() {
    if (argv.o) files.save(argv.o, sim);
    //callback();
  });
}

var timeout, lastTime;
var elapsed = 0;
function calcLoop(nextTime) {
  doCalc();
  elapsed = 0;
  lastTime = Date.now();
  timeout = setTimeout(calcLoop.bind(calcLoop, nextTime), nextTime);
}

ui.on('pause', function() {
  clearTimeout(timeout);
  elapsed += Date.now() - lastTime;
  timeoutTime = Math.max(weekTime - elapsed, 1);
});

ui.on('unpause', function() {
  lastTime = Date.now();
  timeout = setTimeout(calcLoop.bind(calcLoop, weekTime), timeoutTime);
});


calcLoop(weekTime);
