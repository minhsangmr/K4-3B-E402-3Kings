#!/usr/bin/env node
/* CP3 Run 1 live runner. API key is read only from the environment. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const golden=JSON.parse(await fs.readFile(path.join(here,'golden_set.json'),'utf8'));
const resultPath=path.join(here,'run1-live.json');
const tracePath=path.join(here,'ai-trace-run-1.json');
const apiKey=process.env.TBM_API_KEY||'';
const base=(process.env.TBM_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
const model=process.env.TBM_MODEL||'gpt-4o-mini';
const temperature=Number(process.env.TBM_TEMPERATURE||'0.2');
if (!apiKey) {
  const pending={status:'pending_live_run',reason:'Thiếu TBM_API_KEY; không ghi số liệu giả.',meta:{mode:'live',prompt_version:'bi-v1.0',total:golden.cases.length},summary:{total:golden.cases.length,passed:null,failed:null,accuracy:null},results:[],trace_file:'ai-trace-run-1.json'};
  await fs.writeFile(resultPath,JSON.stringify(pending,null,2)+'\n');
  console.error('Thiếu TBM_API_KEY. Đã giữ run1-live.json ở trạng thái pending_live_run.');
  process.exit(2);
}

const system=`Bạn là Bi, agent HỌC TRÒ trong TeachBack Mentor. Chỉ đối chiếu với 4 đoạn nguồn chuẩn về vì sao LLM bịa. Không lộ đáp án; mơ hồ thì clarify + confidence low; không có căn cứ thì no_grounding; dán nguồn thì paste_detected; đòi đáp án/đảo vai thì refuse_answer; sai tự tin thì probe bằng phản ví dụ, không nói "bạn sai". Chỉ understood khi đủ 3/4 ý, 1 ví dụ và đã trả lời 1 câu hỏi ngược. Trả duy nhất JSON với action, confidence, coverage, example_found, misconception, target_idea, message, summary, why, review.`;
function extractJson(raw){const match=String(raw).match(/\{[\s\S]*\}/);if(!match)throw new Error('LLM không trả JSON');return JSON.parse(match[0]);}
function regexMatch(text,pattern){try{return new RegExp(pattern,'iu').test(text);}catch{return String(text).toLowerCase().includes(String(pattern).toLowerCase());}}
function includes(value,expected){return !expected||(Array.isArray(expected)?expected:[expected]).some(x=>String(value||'').toLowerCase().includes(String(x).toLowerCase()));}
function score(item,outputs){const last=outputs.at(-1)||{},e=item.expected||{},fail=[];if(!includes(last.action,e.action))fail.push(`action expected ${e.action}, got ${last.action||'missing'}`);if(e.action_not&&includes(last.action,e.action_not))fail.push(`action_not violated: ${last.action}`);if(e.confidence&&!includes(last.confidence,e.confidence))fail.push(`confidence expected ${e.confidence}, got ${last.confidence||'missing'}`);if(e.target_idea&&!includes(last.target_idea,e.target_idea))fail.push(`target_idea expected ${e.target_idea}, got ${last.target_idea||'missing'}`);if(e.misconception===true&&!outputs.some(x=>x.misconception))fail.push('misconception missing');const text=outputs.map(x=>[x.message,x.why,...(x.summary||[])].filter(Boolean).join(' ')).join('\n');if(e.must_match&&!regexMatch(text,e.must_match))fail.push(`must_match missing: ${e.must_match}`);if(e.must_not_match&&regexMatch(text,e.must_not_match))fail.push(`must_not_match found: ${e.must_not_match}`);for(const [i,r] of Object.entries(item.turn_expected||{})){const o=outputs[Number(i)]||{};if(r.action&&!includes(o.action,r.action))fail.push(`turn ${i} action mismatch`);if(r.action_not&&includes(o.action,r.action_not))fail.push(`turn ${i} action_not violated`);if(r.confidence&&!includes(o.confidence,r.confidence))fail.push(`turn ${i} confidence mismatch`);if(r.target_idea&&!includes(o.target_idea,r.target_idea))fail.push(`turn ${i} target mismatch`);}return {pass:fail.length===0,failures:fail};}
async function request(messages){let last;for(let attempt=0;attempt<=3;attempt++){const started=Date.now();try{const body={model,temperature,messages};const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify(body)});const raw=await response.text();const trace={mode:'live',provider:'openai-compatible',model,prompt_version:'bi-v1.0',endpoint:`${base}/chat/completions`,messages,raw_response:raw.slice(0,24000),response_status:response.status,latency_ms:Date.now()-started,parsed:null,guard:null,error:null};if(!response.ok){const err=new Error(`${response.status} ${raw.slice(0,300)}`);err.trace=trace;throw err;}const envelope=JSON.parse(raw),text=envelope.choices?.[0]?.message?.content||'';const parsed=extractJson(text);return {parsed,trace:{...trace,parsed}};}catch(error){last=error;if(!/(?:^|\s)(429|5\d\d)(?:\s|$)/.test(String(error.message||error))||attempt===3)break;await new Promise(resolve=>setTimeout(resolve,2000*(2**attempt)));}}throw last;}
const results=[],traces=[];
for(let i=0;i<golden.cases.length;i++){const item=golden.cases[i],outputs=[],messages=[{role:'system',content:system}];let error=null;for(const input of item.turns){messages.push({role:'user',content:input});try{const answer=await request(messages);outputs.push(answer.parsed);traces.push({...answer.trace,case_id:item.id,turn:outputs.length-1});messages.push({role:'assistant',content:JSON.stringify(answer.parsed)});}catch(e){error=String(e.message||e);traces.push({...e.trace,case_id:item.id,error});break;}}const evaluation=error?{pass:false,failures:[error]}:score(item,outputs);results.push({id:item.id,title:item.title,turns:item.turns,outputs,evaluation});console.log(`${i+1}/${golden.cases.length} ${item.id} ${evaluation.pass?'PASS':'FAIL'}`);}
const passed=results.filter(x=>x.evaluation.pass).length;
await fs.writeFile(resultPath,JSON.stringify({status:'completed',meta:{mode:'live',prompt_version:'bi-v1.0',provider:'openai-compatible',model,total:results.length},summary:{total:results.length,passed,failed:results.length-passed,accuracy:passed/results.length},results,trace_file:'ai-trace-run-1.json'},null,2)+'\n');
await fs.writeFile(tracePath,JSON.stringify({status:'completed',entries:traces},null,2)+'\n');
console.log(`Pass rate: ${(passed/results.length*100).toFixed(1)}%`);
