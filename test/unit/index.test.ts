import assert from 'assert';
import Pinkie from 'pinkie-promise';
import resolveOnce from 'resolve-once';

describe('resolve-once', () => {
  (() => {
    // patch and restore promise
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();

  it('handle success (no promise)', (callback) => {
    let counter = 0;
    const resolver = resolveOnce<number>(() => Promise.resolve(++counter));

    Promise.all([resolver(), resolver(), resolver()]).then((results) => {
      assert.equal(results.length, 3);

      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then((result) => {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle success (promise)', (callback) => {
    let counter = 0;
    const resolver = resolveOnce(() => Promise.resolve().then(() => ++counter));

    Promise.all([resolver(), resolver(), resolver()]).then((results) => {
      assert.equal(results.length, 3);

      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then((result) => {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle failure (no promise)', (callback) => {
    let counter = 0;
    const resolver = resolveOnce(() =>
      Promise.resolve().then(() => {
        ++counter;
        throw new Error('Failed');
      })
    );

    function wrapError() {
      return new Promise((resolve, _reject) => {
        resolver().catch((err) => {
          assert.equal(counter, 1);
          assert.equal(err.message, 'Failed');
          resolve(counter);
        });
      });
    }

    Promise.all([wrapError(), wrapError(), wrapError()]).then((results) => {
      assert.equal(results.length, 3);

      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().catch((err) => {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });

  it('handle failure (promise)', (callback) => {
    let counter = 0;
    const resolver = resolveOnce(() =>
      Promise.resolve().then(() => {
        ++counter;
        return Promise.reject(new Error('Failed'));
      })
    );

    function wrapError() {
      return new Promise((resolve, _reject) => {
        resolver().catch((err) => {
          assert.equal(counter, 1);
          assert.equal(err.message, 'Failed');
          resolve(counter);
        });
      });
    }

    Promise.all([wrapError(), wrapError(), wrapError()]).then((results) => {
      assert.equal(results.length, 3);

      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().catch((err) => {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });
});
