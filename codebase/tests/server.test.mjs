import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createAppServer } from '../scripts/serve.mjs';

let server;
let base;
before(async () => {
  server = createAppServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('serves app and frozen golden set', async () => {
  assert.equal((await fetch(`${base}/`)).status, 200);
  assert.equal((await fetch(`${base}/engine.js`)).status, 200);
  assert.equal((await fetch(`${base}/eval/golden_set.json`)).status, 200);
});

test('does not expose repo secrets or arbitrary files', async () => {
  assert.equal((await fetch(`${base}/.env`)).status, 404);
  assert.equal((await fetch(`${base}/package.json`)).status, 404);
  assert.equal((await fetch(`${base}/%2e%2e/.env`)).status, 404);
});
