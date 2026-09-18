import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const engineSource = fs.readFileSync(new URL('../engine.js', import.meta.url), 'utf8');
function loadEngine(decision) {
  const window = decision ? { TeachBackDecision: decision } : {};
  const context = vm.createContext({ window, console, setTimeout, clearTimeout });
  vm.runInContext(engineSource, context);
  return window.TBM;
}

test('evaluator compares enum fields exactly', () => {
  const engine = loadEngine();
  for (const action of ['ask_probe', 'not_probe', 'probe_extra']) {
    const result = engine.evaluateCase({ id: 'X', expected: { action: ['probe'] } }, [{ result: { action } }]);
    assert.equal(result.pass, false, action);
  }
  assert.equal(engine.evaluateCase({ id: 'X', expected: { action: ['probe'] } }, [{ result: { action: 'probe' } }]).pass, true);
});

test('evaluator applies global must-not rule to final learner-facing text', () => {
  const engine = loadEngine();
  const result = engine.evaluateCase(
    { id: 'X', expected: { action: ['probe'] } },
    [{ result: { action: 'probe', message: 'Bạn sai rồi.' } }],
    { must_not_match: 'bạn sai|sai rồi' },
  );
  assert.equal(result.pass, false);
  assert.equal(result.failures[0].label, 'global.must_not_match');
});

test('LLM schema normalizes supported aliases and summary strings', () => {
  const engine = loadEngine();
  const result = engine.validateLLMResult({
    action: 'ask_probe', confidence: 'high',
    coverage: { K1: 'hit', K2: 'miss', K3: 'miss', K4: 'miss' },
    example_found: false, misconception: null, target_idea: 'K2',
    message: 'Bạn nói rõ hơn nhé?', summary: 'Một câu', why: 'test', review: ['T04-048', 'BAD'],
  });
  assert.equal(result.action, 'probe');
  assert.deepEqual([...result.summary], ['Một câu']);
  assert.deepEqual([...result.review], ['T04-048']);
});

test('invalid LLM schema falls back to mock and records the error', async () => {
  const decision = {
    request: async () => ({
      text: JSON.stringify({ action: 'invented_action', confidence: 'high', coverage: {}, example_found: false, message: 'x' }),
      raw: '{}', elapsed_ms: 1,
    }),
    getTrace: () => [],
  };
  const engine = loadEngine(decision);
  const result = await engine.decideLLM(engine.SAMPLES.happy, engine.newState(), 'newbie', { provider: 'mock', model: 'mock' });
  assert.equal(result.source, 'mock-fallback');
  assert.match(result.trace.error, /action không hợp lệ/);
});

test('frozen golden v1 checksum matches and current mock run is complete', async () => {
  const goldenRaw = fs.readFileSync(new URL('../../eval/golden_set.json', import.meta.url));
  const expected = fs.readFileSync(new URL('../../eval/golden_set.v1.sha256', import.meta.url), 'utf8').trim().split(/\s+/)[0];
  assert.equal(crypto.createHash('sha256').update(goldenRaw).digest('hex'), expected);
  const engine = loadEngine();
  const run = await engine.runGoldenSet(JSON.parse(goldenRaw), { mode: 'mock' });
  assert.equal(run.meta.engine_version, 'rule-v1.1');
  assert.equal(run.summary.total, 25);
  assert.equal(run.summary.passed, 25);
});
