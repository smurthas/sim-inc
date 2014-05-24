var f = [];
module.exports.factorial = function(n) {
  if (n === 0 || n === 1)
    return 1;
  if (f[n] > 0)
    return f[n];
  f[n] = module.exports.factorial(n-1) * n;
  return f[n];
};

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


// carry out sum to this length. Limited because division gets hard with really
// big numbers. Regardless, for sufficiently large k, mu, and x values things go
// to 0 when they should go to 1.
module.exports._gammaCDFSumLength = 100;

// via wikipedia
module.exports.gammaCDF = function(k, mu, x) {
  var b = k/mu;
  var sum = 0;
  for (var i = k; i < module.exports._gammaCDFSumLength; i++) {
    sum += Math.pow(b*x, i)/module.exports.factorial(i);
  }
  return Math.exp(-b*x) * sum;
};

// invert the gamma CDF, use a recursive bisection search with a limited
// maximum.
// This blows up all over the place and should likely be replaced with a open
// search like secant for false position, or better yet a non-inversion
// approxmiation.
module.exports.gammaRandom = function(k, mu, uniformRandom) {
  if (!(uniformRandom instanceof Function)) uniformRandom = Math.random;
  var r = uniformRandom();
  var fn = module.exports.gammaCDF.bind(null, k, mu);
  return module.exports.bisection(fn, 0, k*mu*4, r, 0.001);
};


// search functions
module.exports.bisection = function(fn, x_min, x_max, y_goal, y_epsilon) {
  var x_mid = (x_min + x_max) / 2.0;
  var y_mid = fn(x_mid);
  var delta = Math.abs((y_mid / y_goal) - 1);
  if (delta < y_epsilon) return x_mid;
  if (y_mid < y_goal) x_min = x_mid;
  else x_max = x_mid;
  return module.exports.bisection(fn, x_min, x_max, y_goal, y_epsilon);
};
