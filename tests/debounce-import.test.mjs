import assert from 'node:assert/strict';
import {test} from 'node:test';
import {debounce} from 'lodash-es';

test('lodash/debounce subpath default import is callable', () => {
  assert.equal(typeof debounce, 'function');
});

test('debounce delays invocation and passes args through', async () => {
  let calls = 0;
  let lastArg;
  const fn = debounce((x) => {
    calls += 1;
    lastArg = x;
  }, 30);

  fn('a');
  fn('b');
  fn('c');

  assert.equal(calls, 0, 'should not fire synchronously');

  await new Promise((r) => setTimeout(r, 60));

  assert.equal(calls, 1, 'should collapse rapid calls into one');
  assert.equal(lastArg, 'c', 'should use the most recent arguments');
});

test('debounced function exposes cancel()', () => {
  const fn = debounce(() => {
    throw new Error('should not run after cancel');
  }, 10);
  fn();
  fn.cancel();
});
