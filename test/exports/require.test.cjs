const assert = require('assert');
const resolveOnce = require('resolve-once');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof resolveOnce, 'function');
  });
});
