import assert from 'assert';
import resolveOnce from 'resolve-once';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof resolveOnce, 'function');
  });
});
