function Feature(name, performance, utility) {
  this.name = name;
  this.usage = 0;

  this.tests = 0;
  this.bugs = 0;

  this.performance = performance;
  this.utility = utility;

  this.live = false;
}

module.exports = Feature;
