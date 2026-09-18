import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('new session clears the previous timer before replacing state', () => {
  const window = {};
  const context = vm.createContext({ window });
  vm.runInContext(fs.readFileSync(new URL('../session-state.js', import.meta.url), 'utf8'), context);
  const events = [];
  const next = window.TBMSessionState.replace(
    { timerId: 42 },
    () => { events.push('create'); return { timerId: null }; },
    id => events.push(`clear:${id}`),
  );
  assert.deepEqual(events, ['clear:42', 'create']);
  assert.equal(next.timerId, null);
});
