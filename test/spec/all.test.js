var chai = require('chai');

var assert = chai.assert;

var resolveOnce = require('../..');

var sleep = function(timeout) {
  return new Promise(function(resolve) {
    setTimeout(resolve, timeout);
  });
};

describe('resolve-once', function() {
  it('handle success (no promise)', function(callback) {
    var counter = 0;
    const resolver = resolveOnce(function() {
      return ++counter;
    });

    Promise.all([resolver(), resolver(), resolver()]).then(function(results) {
      assert.equal(results.length, 3);
      results.forEach(function(result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then(function(result) {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle success (promise)', function(callback) {
    var counter = 0;
    const resolver = resolveOnce(function() {
      return sleep(100).then(function() {
        return ++counter;
      });
    });

    Promise.all([resolver(), resolver(), resolver()]).then(function(results) {
      assert.equal(results.length, 3);
      results.forEach(function(result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then(function(result) {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle failure', function(callback) {
    var counter = 0;
    const resolver = resolveOnce(function() {
      return sleep(100).then(function() {
        ++counter;
        throw new Error('Failed');
      });
    });

    function wrapError() {
      return new Promise(function(resolve, reject) {
        resolver().catch(function(err) {
          assert.equal(counter, 1);
          assert.equal(err.message, 'Failed');
          resolve(counter);
        });
      });
    }

    Promise.all([wrapError(), wrapError(), wrapError()]).then(function(results) {
      assert.equal(results.length, 3);
      results.forEach(function(result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().catch(function(err) {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });
});
