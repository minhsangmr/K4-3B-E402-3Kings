/* TeachBack Mentor · CP3 live AI decision module
 *
 * Responsibilities:
 * - send the central decision prompt to a configured LLM provider;
 * - preserve the raw prompt and raw response for technical verification;
 * - never persist or expose an API key in the trace;
 * - expose a small browser API so the static prototype needs no build step.
 */
(function () {
  'use strict';

  const TRACE_KEY = 'tbm_ai_trace_v1';
  const MAX_RAW_CHARS = 24000;

  function now() { return new Date().toISOString(); }
  function id() { return 'ai-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function clip(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return text.length > MAX_RAW_CHARS ? text.slice(0, MAX_RAW_CHARS) + '\n…[truncated]' : text;
  }
  function readTrace() {
    try { return JSON.parse(localStorage.getItem(TRACE_KEY) || '[]'); }
    catch (_) { return []; }
  }
  function writeTrace(entries) {
    try { localStorage.setItem(TRACE_KEY, JSON.stringify(entries.slice(-30))); }
    catch (_) { /* private browsing/storage quota: the live call still works */ }
  }
  function publish(entry) {
    const entries = readTrace();
    entries.push(entry);
    writeTrace(entries);
    if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new CustomEvent('tbm-ai-trace', { detail: entry }));
  }
  function endpointFor(config) {
    if (config.provider === 'anthropic') return config.base + '/messages';
    if (config.provider === 'gemini') return config.base + '/models/' + encodeURIComponent(config.model) + ':generateContent';
    return config.base + '/chat/completions';
  }
  function requestBody(config, messages) {
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const rest = messages.filter(m => m.role !== 'system');
    if (config.provider === 'anthropic') {
      return {
        model: config.model,
        max_tokens: 1024,
        temperature: config.temp,
        system,
        messages: rest,
      };
    }
    if (config.provider === 'gemini') {
      return {
        system_instruction: { parts: [{ text: system }] },
        contents: rest.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: config.temp },
      };
    }
    return {
      model: config.model,
      temperature: config.temp,
      messages: [{ role: 'system', content: system }, ...rest],
    };
  }
  function requestHeaders(config) {
    const headers = { 'content-type': 'application/json' };
    if (config.provider === 'anthropic') {
      headers['x-api-key'] = config.key;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    } else if (config.provider !== 'gemini' && config.key) {
      headers.Authorization = 'Bearer ' + config.key;
      if (config.provider === 'openrouter') {
        headers['HTTP-Referer'] = location.origin || 'http://localhost';
        headers['X-Title'] = 'TeachBack Mentor';
      }
    }
    return headers;
  }
  function textFromResponse(config, data) {
    if (config.provider === 'anthropic') return (data.content || []).map(x => x.text || '').join('');
    if (config.provider === 'gemini') return (data.candidates?.[0]?.content?.parts || []).map(x => x.text || '').join('');
    return data.choices?.[0]?.message?.content || '';
  }

  async function request(options) {
    const config = options.config;
    const traceId = id();
    const endpoint = endpointFor(config);
    const body = requestBody(config, options.messages);
    const started = performance.now();
    const entry = {
      trace_id: traceId,
      timestamp: now(),
      provider: config.provider,
      model: config.model,
      endpoint,
      request: body,
      response_status: null,
      response_raw: null,
      elapsed_ms: null,
      error: null,
    };
    try {
      const url = config.provider === 'gemini'
        ? endpoint + '?key=' + encodeURIComponent(config.key)
        : endpoint;
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders(config),
        body: JSON.stringify(body),
      });
      const raw = await response.text();
      entry.response_status = response.status;
      entry.response_raw = clip(raw);
      entry.elapsed_ms = Math.round(performance.now() - started);
      if (!response.ok) throw new Error(response.status + ' ' + raw.slice(0, 300));
      const data = JSON.parse(raw);
      const text = textFromResponse(config, data);
      if (!text) throw new Error('LLM response không có nội dung text');
      publish(entry);
      return { text, raw, trace_id: traceId, elapsed_ms: entry.elapsed_ms };
    } catch (error) {
      entry.elapsed_ms = entry.elapsed_ms ?? Math.round(performance.now() - started);
      entry.error = String(error?.message || error);
      publish(entry);
      throw error;
    }
  }

  window.TeachBackDecision = {
    request,
    getTrace: readTrace,
    clearTrace: function () {
      try { localStorage.removeItem(TRACE_KEY); } catch (_) {}
      if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new CustomEvent('tbm-ai-trace-cleared'));
    },
    traceKey: TRACE_KEY,
  };
})();
