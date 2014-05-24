var fs = require('fs');

var _ = require('underscore');

var Stats = require('./stats');

function firstColumnCap(filename) {
  var lines = fs.readFileSync(filename).toString().split('\n');
  return _.map(lines, function(line) {
    var n = line.split(' ')[0];
    return n.charAt(0).toUpperCase() + n.substring(1).toLowerCase();
  });
}

var maleFirstNames = firstColumnCap('males.txt');
var femaleFirstNames = firstColumnCap('females.txt');
var lastNames = firstColumnCap('last.txt');

function getRandomFromArray(arr, stddev) {
  var i = Math.floor(Math.abs(Stats.gaussRandom() * stddev));
  if (i >= arr.length) return getRandomFromArray(arr, stddev);
  return arr[i];
}

module.exports.randomName = function(male) {
  var first;
  if(male) first = getRandomFromArray(maleFirstNames, 38);
  else first = getRandomFromArray(femaleFirstNames, 90);
  var last = getRandomFromArray(lastNames, 535);
  return first + ' ' + last;
};
