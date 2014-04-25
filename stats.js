
// from http://stackoverflow.com/a/196941/279903
module.exports.gaussRandom = function(uniformRand) {
  if (!uniformRand) uniformRand = Math.random;
  var u = 2*uniformRand()-1;
  var v = 2*uniformRand()-1;
  var r = u*u + v*v;
  // if outside interval [0,1] start over
  if(r === 0 || r > 1) return module.exports.gaussRandom(uniformRand);

  var c = Math.sqrt(-2*Math.log(r)/r);
  return u*c;
};

module.exports.poissonRandom = function(lambda, uniformRandom) {
  if (!uniformRandom) uniformRandom = Math.random;
  var L = Math.exp(-lambda);
  var k = 0;
  var p = 1;

  do {
    k++;
    var u = uniformRandom();
    p *= u;
  } while (p > L);

  return k - 1;
};
