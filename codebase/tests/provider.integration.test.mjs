import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../ai-decision.js', import.meta.url), 'utf8');
function loadDecision(fetchImpl) {
  const store = new Map();
  const window = {};
  const context = vm.createContext({
    window, console, fetch: fetchImpl, Response, AbortController, performance,
    setTimeout, clearTimeout,
    localStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) },
  });
  vm.runInContext(source, context);
  return window.TeachBackDecision;
}

test('OpenAI-compatible adapter sends bearer auth and extracts text', async () => {
  let captured;
  const decision = loadDecision(async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 });
  });
  const result = await decision.request({
    config: { provider: 'ninerouter', base: 'http://localhost:20128/v1', model: 'combo', key: 'secret', temp: 0.3, timeoutMs: 1000 },
    messages: [{ role: 'system', content: 'system' }, { role: 'user', content: 'hello' }],
  });
  assert.equal(captured.url, 'http://localhost:20128/v1/chat/completions');
  assert.equal(captured.options.headers.Authorization, 'Bearer secret');
  assert.equal(result.text, '{"ok":true}');
  assert.equal(decision.getTrace()[0].endpoint.includes('secret'), false);
});

test('Gemini adapter keeps the key out of stored endpoint trace', async () => {
  let capturedUrl;
  const decision = loadDecision(async url => {
    capturedUrl = url;
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }), { status: 200 });
  });
  const result = await decision.request({
    config: { provider: 'gemini', base: 'https://example.test/v1beta', model: 'gemini-test', key: 'gem-key', temp: 0.3, timeoutMs: 1000 },
    messages: [{ role: 'system', content: 'system' }, { role: 'user', content: 'hello' }],
  });
  assert.match(capturedUrl, /key=gem-key/);
  assert.equal(result.text, '{"ok":true}');
  assert.equal(decision.getTrace()[0].endpoint.includes('gem-key'), false);
});

test('provider request aborts at configured timeout', async () => {
  const decision = loadDecision((url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  await assert.rejects(
    decision.request({ config: { provider: 'custom', base: 'http://localhost/v1', model: 'x', key: '', temp: 0.3, timeoutMs: 10 }, messages: [] }),
    /timeout sau 10 ms/,
  );
});
