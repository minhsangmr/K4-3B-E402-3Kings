/* TeachBack Mentor · CP3 Eval tab */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  let golden = null;
  let lastRun = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function casesOf(value) { return Array.isArray(value) ? value : (value?.cases || []); }
  function setProgress(index, total, label) {
    const bar = $('#ev-progress');
    if (bar) bar.style.width = total ? `${Math.round(index / total * 100)}%` : '0%';
    const summary = $('#ev-summary');
    if (summary && label) summary.innerHTML = `<div class="eval-stat">Trạng thái<b>${escapeHtml(label)}</b></div>`;
  }
  function renderSummary(run) {
    const s = run.summary || { total: 0, passed: 0, failed: 0, accuracy: 0 };
    $('#ev-summary').innerHTML = `
      <div class="eval-stat">Tổng case<b>${s.total}</b></div>
      <div class="eval-stat">Đạt<b class="pass">${s.passed}</b></div>
      <div class="eval-stat">Lỗi<b class="fail">${s.failed}</b></div>
      <div class="eval-stat">Tỷ lệ<b>${(s.accuracy * 100).toFixed(1)}%</b></div>`;
  }
  function renderRows(run) {
    const rows = run.results || [];
    $('#ev-table').innerHTML = rows.map(row => {
      const last = row.turns?.[row.turns.length - 1]?.result || {};
      const failures = row.evaluation?.failures || [];
      const trace = last.trace || {};
      const traceText = trace.mode === 'mock'
        ? `mock · ${trace.rule_path || last.action || '—'}`
        : `${trace.mode || '—'} · ${trace.provider || '—'} / ${trace.model || '—'} · ${trace.latency_ms ?? '—'} ms`;
      return `<tr>
        <td><b>${escapeHtml(row.id)}</b><small>${escapeHtml(row.title)}</small></td>
        <td><code>${escapeHtml(row.group)}</code> ${row.layer ? `<span class="badge">${escapeHtml(row.layer)}</span>` : ''}<small>${escapeHtml(row.turns?.[0]?.input || '')}</small></td>
        <td class="${row.evaluation?.pass ? 'pass' : 'fail'}">${row.evaluation?.pass ? 'PASS' : 'FAIL'}<small>${escapeHtml(last.action || '—')} · ${escapeHtml(last.confidence || '—')}${failures.length ? `<br>${escapeHtml(failures.map(f => f.label).join(', '))}` : ''}</small></td>
        <td><code>${escapeHtml(traceText)}</code>${trace.error ? `<small class="fail">${escapeHtml(trace.error)}</small>` : ''}</td>
      </tr>`;
    }).join('');
  }
  async function loadDefault() {
    try {
      const response = await fetch('../eval/golden_set.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      golden = await response.json();
      setProgress(0, casesOf(golden).length, `Đã nạp ${casesOf(golden).length} case`);
    } catch (error) {
      golden = null;
      setProgress(0, 0, 'Không nạp được tự động — mở qua localhost hoặc chọn file JSON');
    }
  }
  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        golden = JSON.parse(reader.result);
        setProgress(0, casesOf(golden).length, `Đã nạp ${casesOf(golden).length} case từ file`);
      } catch (error) { setProgress(0, 0, `JSON không hợp lệ: ${error.message}`); }
    };
    reader.readAsText(file);
  }
  function exportFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    URL.revokeObjectURL(url);
  }
  function markdownRun(run) {
    const lines = [`# CP3 Eval ${run.meta?.mode || 'unknown'}`, '', `- Generated: ${run.meta?.generated_at || '—'}`, `- Total: ${run.summary?.total || 0}`, `- Passed: ${run.summary?.passed || 0}`, `- Failed: ${run.summary?.failed || 0}`, `- Accuracy: ${((run.summary?.accuracy || 0) * 100).toFixed(1)}%`, '', '| Case | Result | Action | Failure |', '|---|---|---|---|'];
    for (const row of run.results || []) lines.push(`| ${row.id} | ${row.evaluation?.pass ? 'PASS' : 'FAIL'} | ${row.turns?.at(-1)?.result?.action || '—'} | ${(row.evaluation?.failures || []).map(x => x.label).join(', ') || '—'} |`);
    return lines.join('\n');
  }
  async function run() {
    const list = casesOf(golden);
    if (!list.length) { setProgress(0, 0, 'Chưa có golden set'); return; }
    const mode = $('#ev-mode').value;
    $('#ev-run').disabled = true;
    setProgress(0, list.length, `Đang chạy ${mode.toUpperCase()}…`);
    try {
      lastRun = await window.TBM.runGoldenSet(golden, {
        mode,
        config: window.getTBMConfig?.() || {},
        delayMs: mode === 'mock' ? 0 : 0,
        onProgress: event => setProgress(event.index, event.total, `${event.index}/${event.total} · ${event.id} · ${event.pass ? 'PASS' : 'FAIL'}`),
      });
      renderSummary(lastRun); renderRows(lastRun);
      setProgress(list.length, list.length, `${mode.toUpperCase()} hoàn tất`);
    } catch (error) {
      setProgress(0, list.length, `Lỗi chạy Eval: ${error.message}`);
    } finally { $('#ev-run').disabled = false; }
  }
  $('#ev-file').addEventListener('change', event => readFile(event.target.files?.[0]));
  $('#ev-load-default').onclick = loadDefault;
  $('#ev-run').onclick = run;
  $('#ev-export-json').onclick = () => lastRun && exportFile('run1-result.json', JSON.stringify(lastRun, null, 2), 'application/json');
  $('#ev-export-md').onclick = () => lastRun && exportFile('run1-result.md', markdownRun(lastRun), 'text/markdown');
  loadDefault();
})();
