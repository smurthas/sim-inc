function Feature(name) {
  this.name = name;
  this.usage = 0;

  this.tests = 0;
  this.bugs = 0;

  this.performance = null;
  this.utility = null;

  this.live = false;
}

module.exports = Feature;
