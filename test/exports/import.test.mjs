import assert from 'assert';
import resolveOnce from 'resolve-once';

describe('exports .mjs', () => {
  it('default', () => {
    assert.equal(typeof resolveOnce, 'function');
  });
});
