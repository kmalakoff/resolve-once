var assert = require('assert');

var resolveOnce = require('../..');

describe('resolve-once', function () {
  if (typeof Promise === 'undefined') return; // no promise support

  it('handle success (no promise)', function (callback) {
    var counter = 0;
    const resolver = resolveOnce(function () {
      return ++counter;
    });

    Promise.all([resolver(), resolver(), resolver()]).then(function (results) {
      assert.equal(results.length, 3);
      results.forEach(function (result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then(function (result) {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle success (promise)', function (callback) {
    var counter = 0;
    const resolver = resolveOnce(function () {
      return Promise.resolve().then(function () {
        return ++counter;
      });
    });

    Promise.all([resolver(), resolver(), resolver()]).then(function (results) {
      assert.equal(results.length, 3);
      results.forEach(function (result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then(function (result) {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle failure (no promise)', function (callback) {
    var counter = 0;
    const resolver = resolveOnce(function () {
      return Promise.resolve().then(function () {
        ++counter;
        throw new Error('Failed');
      });
    });

    function wrapError() {
      return new Promise(function (resolve, reject) {
        resolver().catch(function (err) {
          assert.equal(counter, 1);
          assert.equal(err.message, 'Failed');
          resolve(counter);
        });
      });
    }

    Promise.all([wrapError(), wrapError(), wrapError()]).then(function (results) {
      assert.equal(results.length, 3);
      results.forEach(function (result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().catch(function (err) {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });

  it('handle failure (promise)', function (callback) {
    var counter = 0;
    const resolver = resolveOnce(function () {
      return Promise.resolve().then(function () {
        ++counter;
        return Promise.reject(new Error('Failed'));
      });
    });

    function wrapError() {
      return new Promise(function (resolve, reject) {
        resolver().catch(function (err) {
          assert.equal(counter, 1);
          assert.equal(err.message, 'Failed');
          resolve(counter);
        });
      });
    }

    Promise.all([wrapError(), wrapError(), wrapError()]).then(function (results) {
      assert.equal(results.length, 3);
      results.forEach(function (result) {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().catch(function (err) {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });
});
