require('./polyfills');
var UNRESOLVED = 0;
var RESOLVING = 1;
var RESOLVED_SUCCESS = 2;
var RESOLVED_ERROR = 3;

module.exports = function (fn) {
  var state = UNRESOLVED;
  var result;
  var waiting = [];

  function resolveResult() {
    if (state === RESOLVING) return;
    state = RESOLVING;

    Promise.resolve(fn())
      .then(function (value) {
        state = RESOLVED_SUCCESS;
        result = value;
        while (waiting.length) waiting.pop().resolve(result);
      })
      .catch(function (err) {
        state = RESOLVED_ERROR;
        result = err;
        while (waiting.length) waiting.pop().reject(result);
      });
  }

  return function () {
    if (state === RESOLVED_SUCCESS) return Promise.resolve(result);
    else if (state === RESOLVED_ERROR) return Promise.reject(result);

    const promise = new Promise(function (resolve, reject) {
      waiting.push({ resolve: resolve, reject: reject });
    });
    resolveResult();
    return promise;
  };
};
