(function(){
  const els = {
    file:document.querySelector('#ev-file'),
    load:document.querySelector('#ev-load-default'),
    mode:document.querySelector('#ev-mode'),
    run:document.querySelector('#ev-run'),
    progress:document.querySelector('#ev-progress'),
    summary:document.querySelector('#ev-summary'),
    table:document.querySelector('#ev-table'),
    exportJson:document.querySelector('#ev-export-json'),
    exportMd:document.querySelector('#ev-export-md'),
  };
  if(Object.values(els).some(el=>!el)){
    console.warn('[eval-tab] thiếu phần tử #ev-*');
    return;
  }

  let golden = null;
  let latestRun = null;
  const escHtml = value => String(value ?? '').replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const display = value => Array.isArray(value) ? value.join(' | ') : (value ?? '—');

  function setExports(enabled){
    els.exportJson.disabled = !enabled;
    els.exportMd.disabled = !enabled;
  }

  function setGolden(data, source){
    const cases = Array.isArray(data) ? data : data?.cases;
    if(!Array.isArray(cases) || !cases.length) throw new Error('JSON phải có cases[] và ít nhất 1 case');
    golden = data;
    latestRun = null;
    setExports(false);
    els.run.disabled = false;
    els.summary.innerHTML = '';
    els.progress.textContent = `Đã nạp ${cases.length} case từ ${source}.`;
    els.table.innerHTML = '<thead><tr><th>ID</th><th>Group</th><th>Layer</th><th>Nguồn</th><th>Expected</th><th>Got</th><th>Kết quả</th><th>Reasons</th><th>Trace</th></tr></thead><tbody><tr><td colspan="9">Sẵn sàng chạy.</td></tr></tbody>';
  }

  function loadText(text, source){
    try{ setGolden(JSON.parse(text), source); }
    catch(error){
      golden = null;
      els.run.disabled = true;
      els.progress.textContent = `Không nạp được golden set: ${error.message}`;
    }
  }

  function traceDetails(trace){
    if(!trace) return '—';
    const meta = [trace.mode, trace.provider, trace.model, trace.prompt_version, `${trace.latency_ms ?? 0} ms`].filter(Boolean).join(' · ');
    return `<details><summary>Xem trace</summary>
      <div><b>${escHtml(meta)}</b></div>
      ${trace.guard?`<div><b>Guard:</b> ${escHtml(trace.guard)}</div>`:''}
      ${trace.error?`<div><b>Error:</b> ${escHtml(trace.error)}</div>`:''}
      ${trace.rule_path?`<div><b>Rule:</b> ${escHtml(trace.rule_path)}</div>`:''}
      ${trace.system_prompt?`<div><b>System prompt</b><pre>${escHtml(trace.system_prompt)}</pre></div>`:''}
      ${trace.raw_response!=null?`<div><b>Raw response</b><pre>${escHtml(trace.raw_response)}</pre></div>`:''}
      ${trace.parsed?`<div><b>Parsed</b><pre>${escHtml(JSON.stringify(trace.parsed,null,2))}</pre></div>`:''}
    </details>`;
  }

  function renderSummary(run){
    const labels = {common:'Thường',layer1:'①',layer2:'②',layer3:'③',layer4:'④',rare:'Hiếm'};
    const groups = Object.entries(run.summary.by_group).map(([key,score])=>
      `<span class="badge ${score.fail?'low':'high'}">${labels[key] || key}: ${score.pass}/${score.total}</span>`).join(' ');
    els.summary.innerHTML = `<div><b>${run.summary.pass}/${run.meta.n} đạt · ${run.summary.pct}%</b> · ${run.summary.fail} thất bại</div><div style="margin-top:8px">${groups}</div>`;
  }

  function renderTable(run){
    const rows = run.results.map(result=>{
      const final = result.final || {};
      const expected = result.expected?.action || result.expected?.action_not?.map(x=>'≠'+x) || [];
      const got = [final.action, final.target_idea, final.confidence].filter(Boolean).join(' · ');
      const source = result.source?.turn_ids?.length ? result.source.turn_ids.join(', ') : (result.source?.type || '—');
      return `<tr>
        <td><b>${escHtml(result.id)}</b></td><td>${escHtml(result.group)}</td><td>${escHtml(result.layer || '—')}</td>
        <td>${escHtml(source)}</td><td>${escHtml(display(expected))}</td><td>${escHtml(got || '—')}</td>
        <td><b style="color:var(--${result.pass?'green':'red'})">${result.pass?'PASS':'FAIL'}</b></td>
        <td>${escHtml(result.reasons.join('; ') || '—')}</td><td>${traceDetails(final.trace)}</td>
      </tr>`;
    }).join('');
    els.table.innerHTML = `<thead><tr><th>ID</th><th>Group</th><th>Layer</th><th>Nguồn</th><th>Expected</th><th>Got</th><th>Kết quả</th><th>Reasons</th><th>Trace</th></tr></thead><tbody>${rows}</tbody>`;
  }

  function timestamp(){
    const d = new Date();
    const p = n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }

  function download(name, text, type){
    const url = URL.createObjectURL(new Blob([text],{type}));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),0);
  }

  function markdown(run){
    const clean = value=>String(value ?? '').replace(/\|/g,'\\|').replace(/\s+/g,' ').trim();
    const rows = run.results.map(result=>{
      const final = result.final || {};
      const expected = result.expected?.action || result.expected?.action_not?.map(x=>'not '+x) || [];
      const got = [final.action,final.target_idea,final.confidence].filter(Boolean).join(' / ');
      return `| ${clean(result.id)} | ${clean(result.group)} | ${clean(display(expected))} | ${clean(got)} | ${result.pass?'PASS':'FAIL'} | ${clean(result.reasons.join('; ') || '—')} |`;
    }).join('\n');
    return `# Eval ${run.meta.mode} · ${run.meta.run_at}\n\n| id | group | expected | got | pass | reasons |\n|---|---|---|---|---|---|\n${rows}\n`;
  }

  els.load.onclick = async()=>{
    els.progress.textContent = 'Đang nạp ../eval/golden_set.json…';
    try{
      const response = await fetch('../eval/golden_set.json');
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      setGolden(await response.json(),'eval/golden_set.json');
    }catch(error){
      els.progress.textContent = `Không nạp được (${error.message}). Chạy: python3 -m http.server 8000 tại gốc repo, mở http://localhost:8000/codebase/ — hoặc chọn file bằng ô phía trên.`;
    }
  };

  els.file.onchange = ()=>{
    const file = els.file.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>loadText(reader.result,file.name);
    reader.onerror = ()=>{ els.progress.textContent = 'Không đọc được file đã chọn.'; };
    reader.readAsText(file,'utf-8');
  };

  els.run.onclick = async()=>{
    if(!golden) return;
    const mode = els.mode.value;
    const config = typeof cfg === 'function' ? cfg() : {};
    if(mode === 'live' && !config.key && config.provider !== 'custom'){
      els.progress.textContent = 'Mode live cần API key. Nhập key và bật Live ở tab ③ trước.';
      return;
    }
    latestRun = null; setExports(false); els.run.disabled = true; els.load.disabled = true; els.file.disabled = true;
    els.summary.innerHTML = ''; els.progress.textContent = 'Đang chạy…';
    try{
      latestRun = await TBM.runGoldenSet(golden,{mode,config,onProgress:({completed,total,case:c,result})=>{
        els.progress.textContent = `${completed}/${total} · ${c.id} · ${result.final?.action || '—'} ${result.pass?'✓':'✗'}`;
      }});
      renderSummary(latestRun); renderTable(latestRun); setExports(true);
      els.progress.textContent = `Hoàn tất ${latestRun.meta.n}/${latestRun.meta.n} case · ${latestRun.summary.pass} PASS · ${latestRun.summary.fail} FAIL.`;
    }catch(error){ els.progress.textContent = `Runner lỗi: ${error.message || error}`; }
    finally{ els.run.disabled = false; els.load.disabled = false; els.file.disabled = false; }
  };

  els.exportJson.onclick = ()=>{
    if(latestRun) download(`run-${latestRun.meta.mode}-${timestamp()}.json`,JSON.stringify(latestRun,null,2),'application/json');
  };
  els.exportMd.onclick = ()=>{
    if(latestRun) download(`run-${latestRun.meta.mode}-${timestamp()}.md`,markdown(latestRun),'text/markdown');
  };

  els.run.disabled = true;
  setExports(false);
  console.log('[eval-tab] ready');
})();
