import assert from 'assert';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';

// @ts-ignore
import resolveOnce from 'resolve-once';

describe('resolve-once', () => {
  const root = typeof global !== 'undefined' ? global : window;
  let rootPromise: Promise;
  before(() => {
    rootPromise = root.Promise;
    root.Promise = Promise;
  });
  after(() => {
    root.Promise = rootPromise;
  });

  it('handle success (no promise)', (callback) => {
    let counter = 0;
    const resolver = resolveOnce(() => ++counter);

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
