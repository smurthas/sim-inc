function Feature(feature) {
  this.name = feature.name;
  this.usage = feature.usage || 0;

  this.tests = feature.tests || 0;
  this.bugs = feature.bugs || 0;

  this.performance = feature.performance;
  this.utility = feature.utility;

  this.rawCOGS = feature.rawCOGS || 0;
  this.COGSReduction = feature.COGSReduction || 0.5;

  this.live = feature.live || false;
}

module.exports = Feature;
