#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const mode = process.argv[2] || 'mock';
if (!['mock', 'live'].includes(mode)) throw new Error('Mode phải là mock hoặc live');

const goldenPath = path.join(here, 'golden_set.json');
const checksumPath = path.join(here, 'golden_set.v1.sha256');
const goldenRaw = await fs.readFile(goldenPath);
const goldenSha256 = crypto.createHash('sha256').update(goldenRaw).digest('hex');
const expectedSha256 = (await fs.readFile(checksumPath, 'utf8')).trim().split(/\s+/)[0];
if (goldenSha256 !== expectedSha256) throw new Error(`Golden v1 checksum lệch: ${goldenSha256}`);
const golden = JSON.parse(goldenRaw);

globalThis.window = {};
globalThis.location = { origin: 'http://127.0.0.1:8000' };
vm.runInThisContext(await fs.readFile(path.join(root, 'codebase', 'ai-decision.js'), 'utf8'));
vm.runInThisContext(await fs.readFile(path.join(root, 'codebase', 'engine.js'), 'utf8'));

const providerEnv = {
  openai: ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL'],
  anthropic: ['ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_MODEL'],
  gemini: ['GEMINI_API_KEY', 'GEMINI_BASE_URL', 'GEMINI_MODEL'],
  openrouter: ['OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL', 'OPENROUTER_MODEL'],
  ninerouter: ['NINE_ROUTER_API_KEY', 'NINE_ROUTER_BASE_URL', 'NINE_ROUTER_MODEL'],
  custom: ['CUSTOM_LLM_API_KEY', 'CUSTOM_LLM_BASE_URL', 'CUSTOM_LLM_MODEL'],
};
const provider = process.env.TBM_PROVIDER || 'ninerouter';
const names = providerEnv[provider];
if (mode === 'live' && !names) throw new Error(`Provider không hỗ trợ: ${provider}`);
const defaults = window.TBM.PROVIDERS[provider] || window.TBM.PROVIDERS.custom;
const config = mode === 'live' ? {
  provider,
  key: process.env.TBM_API_KEY || process.env[names[0]] || '',
  base: (process.env.TBM_BASE_URL || process.env[names[1]] || defaults.base).replace(/\/$/, ''),
  model: process.env.TBM_MODEL || process.env[names[2]] || defaults.model,
  temp: Number(process.env.TBM_TEMPERATURE || 0.3),
  timeoutMs: Number(process.env.TBM_TIMEOUT_MS || 20000),
  live: true,
} : {};
if (mode === 'live' && !config.key && provider !== 'custom') throw new Error(`Thiếu API key cho ${provider}`);

const run = await window.TBM.runGoldenSet(golden, {
  mode,
  config,
  onProgress: event => console.log(`${event.index}/${event.total} ${event.id} ${event.pass ? 'PASS' : 'FAIL'}`),
});
const fallbackCases = run.results.filter(result => result.execution_mode === 'mock-fallback').length;
const measuredCases = run.results.length - fallbackCases;
const measuredPassed = run.results.filter(result => result.execution_mode !== 'mock-fallback' && result.evaluation.pass).length;
const validMeasurement = fallbackCases === 0 && measuredCases === run.results.length;
run.meta = {
  ...run.meta,
  run_at: new Date().toISOString(),
  provider: mode === 'live' ? config.provider : 'rule-based',
  model: mode === 'live' ? config.model : window.TBM.RULE_VERSION,
  golden_version: golden.version,
  golden_sha256: goldenSha256,
  status: mode === 'live' && !validMeasurement ? 'invalid_provider_run' : 'completed',
};
run.summary = {
  ...run.summary,
  measured_cases: measuredCases,
  measured_passed: measuredPassed,
  measured_accuracy: measuredCases ? measuredPassed / measuredCases : null,
  provider_error_cases: fallbackCases,
  valid_measurement: mode === 'mock' || validMeasurement,
};

const output = path.join(here, `run2-${mode}.json`);
await fs.writeFile(output, JSON.stringify(run, null, 2) + '\n');
console.log(`${output}: ${run.summary.passed}/${run.summary.total} (${(run.summary.accuracy * 100).toFixed(1)}%), provider errors=${fallbackCases}`);
if (mode === 'live' && fallbackCases) process.exitCode = 2;
