/* =====================================================================
   0. DỮ LIỆU DÙNG CHUNG — nguồn chuẩn, 4 ý chính, mẫu nhầm lẫn, câu mẫu
   ===================================================================== */
const SOURCES = [
  {code:'T04-047', text:'Mô hình ngôn ngữ lớn sinh văn bản bằng cách dự đoán token kế tiếp có xác suất cao nhất dựa trên chuỗi đã có — nó không tra cứu một kho sự thật nào.'},
  {code:'T04-048', text:'Vì chỉ chọn token theo xác suất, mô hình có thể sinh ra chuỗi nghe rất trôi chảy, hợp lý nhưng không đúng — đó là hallucination; trong mô hình không có bước kiểm tra sự thật.'},
  {code:'T06-138', text:'Bịa còn đến từ dữ liệu: dữ liệu huấn luyện thiếu, cũ hoặc lệch (bias); và quá trình fine-tuning/RLHF thưởng cho câu trả lời trôi chảy, vừa lòng người hỏi hơn là câu "tôi không biết".'},
  {code:'T06-139', text:'Để giảm rủi ro: đưa tài liệu tin cậy vào ngữ cảnh (RAG), yêu cầu trích dẫn nguồn và kiểm chứng lại trước khi dùng.'},
];
const IDEAS = [
  {id:'K1', short:'Dự đoán token kế tiếp theo xác suất, không tra cứu sự thật', src:'T04-047',
   strong:[/dự đoán|predict|tiên đoán|dự báo/iu, /token|(từ|chữ|word) (kế|tiếp|sau)|next (word|token)/iu, /xác suất|probab|khả năng (cao|lớn) nhất|hay xuất hiện|thường (đi|xuất hiện) (cùng|sau)|likelihood/iu, /(đoán|sinh|chọn|tạo) (ra )?(từ|chữ|token) (tiếp|kế|sau)/iu],
   weak:[/đoán (chữ|từ)|ghép (chữ|từ)|nối (chữ|từ)|autocomplete|gợi ý (chữ|từ)|máy đoán|bộ đoán|đoán mò|ghép câu/iu],
   probe:{newbie:'Bạn nói LLM "tạo ra" câu trả lời — nhưng nó tạo bằng cách nào, từng bước một? Mình chưa hình dung được.', mid:'Nếu không tra cứu ở đâu cả, thì mỗi chữ nó viết ra được chọn dựa trên cái gì? Bạn tả cho mình một bước thôi.'},
   clarify:'Bạn nói "{m}" — ý bạn là cách mô hình chọn ra chữ tiếp theo, hay là nó ghép các câu có sẵn lại? Mình chưa chắc mình hiểu đúng.'},
  {id:'K2', short:'Không có bước kiểm tra sự thật → câu "nghe hợp lý" vẫn có thể sai', src:'T04-048',
   strong:[/không .{0,30}(đúng hay sai|đúng sai|đúng\/sai|sự thật|thật giả|thật hay giả)|kiểm tra (sự thật|đúng sai)/iu, /nghe (rất |cực |khá |có vẻ )?(hợp lý|trôi chảy|xuôi|thật|thuyết phục|mượt)|hợp lý nhưng|plausible|trôi chảy|xuôi tai|mượt mà|thuyết phục nhưng/iu, /không (hiểu|biết) (nghĩa|ý nghĩa|nội dung|mình đang nói|nó đang nói|thứ nó nói)/iu],
   weak:[/nói bừa|chém gió|phịa|đoán bừa/iu],
   probe:{newbie:'Nếu nó cứ chọn chữ có khả năng cao nhất, thì vì sao câu ra vẫn có thể sai? Mình tưởng "khả năng cao" là đúng chứ?', mid:'Vậy trong lúc sinh câu, có bước nào nó dừng lại để đối chiếu với sự thật không? Nếu không thì chuyện gì xảy ra?'},
   clarify:'Bạn nói "{m}" — ý là câu nghe có vẻ đúng nhưng thực ra không được kiểm tra, đúng không? Mình chưa chắc.'},
  {id:'K3', short:'Nguyên nhân từ dữ liệu (thiếu/lệch) và fine-tuning/RLHF thưởng câu "vừa lòng"', src:'T06-138',
   strong:[/dữ liệu (huấn luyện|train|học|đầu vào)|training data|data (bias|lệch|thiếu)|bias|thiên lệch|thiếu dữ liệu|dữ liệu (cũ|thiếu|sai|lệch|không đủ|bị lệch)|không có trong dữ liệu|chưa (từng )?(thấy|học) (trong dữ liệu|bao giờ)/iu, /rlhf|fine[- ]?tun|tinh chỉnh|huấn luyện lại|phần thưởng|reward|được thưởng|feedback (của )?(người|con người)/iu, /vừa lòng|làm hài lòng|chiều (người|user)|thích trả lời|ngại nói không biết|thà bịa|nói không biết|ưu tiên (trả lời|câu) (trôi chảy|hay|mượt)/iu],
   weak:[/học từ (mạng|internet|web)|đọc (trên )?(mạng|internet)/iu],
   probe:{newbie:'Bạn có nhắc tới dữ liệu — nhưng dữ liệu thì liên quan gì tới chuyện nó bịa? Mình chưa nối được hai ý này.', mid:'Ngoài cơ chế sinh chữ, theo bạn quá trình huấn luyện có góp phần làm nó "thích" bịa hơn là im lặng không? Vì sao?'},
   clarify:'Bạn nói "{m}" — ý là dữ liệu mà nó học có vấn đề, hay là cách người ta huấn luyện nó? Mình chưa rõ.'},
  {id:'K4', short:'Giảm bịa bằng RAG / trích dẫn nguồn / kiểm chứng', src:'T06-139',
   strong:[/\brag\b|retriev|truy xuất|tra cứu tài liệu|(đưa|cho|kèm|nạp) (nó |thêm )?(xem |đọc )?tài liệu|context (tin cậy|đáng tin)|ngữ cảnh (tin cậy|đúng)|tài liệu (tin cậy|chuẩn|thật) vào/iu, /trích dẫn|citation|dẫn nguồn|nêu nguồn|ghi nguồn|kèm nguồn|có nguồn|chỉ ra nguồn/iu, /kiểm chứng|verify|đối chiếu|fact[- ]?check|kiểm tra lại|xác minh|tra lại/iu],
   weak:[],
   probe:{newbie:'Vậy có cách nào để nó bớt bịa không? Hay mình phải chịu?', mid:'Nếu bạn là người build sản phẩm, bạn sẽ làm gì với mô hình để giảm chuyện này? Nêu một cách cụ thể thôi.'},
   clarify:'Bạn nói "{m}" — ý là đưa thêm tài liệu cho nó đọc, hay là bắt nó chỉ ra nguồn? Mình chưa chắc.'},
];
const MISCONCEPTIONS = [
  {re:/tra cứu (google|mạng|internet|web)|lên mạng (tra|tìm)|search (google|web)|tìm trên google|google rồi/iu, idea:'K1', note:'Nhầm: LLM tra cứu web (trái với [T04-047])',
   probe:'Bạn nói nó lên mạng tra Google — vậy lúc không có mạng nó có trả lời được không? Mình dùng offline vẫn thấy nó trả lời mà. Bạn thử nghĩ lại xem chữ nó lấy ở đâu ra?'},
  {re:/cố tình|cố ý|nói dối|lừa (mình|người)|có ý thức|biết là sai (mà|nhưng)/iu, idea:'K2', note:'Nhầm: gán ý đồ cho mô hình (trái với [T04-048])',
   probe:'"Cố tình nói dối" nghĩa là nó biết đâu là sự thật rồi mới chọn nói khác, đúng không? Theo bài thì mô hình có biết đâu là sự thật không nhỉ?'},
  {re:/hết (bộ nhớ|ram)|database|cơ sở dữ liệu|lưu (sẵn|hết|trong)|lấy ra thôi/iu, idea:'K1', note:'Nhầm: coi LLM như kho lưu câu trả lời (trái với [T04-047])',
   probe:'Bạn hình dung nó lưu sẵn câu trả lời rồi lấy ra à? Hay nó tạo ra lúc mình hỏi? Bạn thử tả lại xem lúc mình gõ câu hỏi thì bên trong xảy ra gì.'},
];
const SAMPLES = {
  happy:'Theo mình hiểu, LLM không tra cứu sự thật mà chỉ dự đoán token kế tiếp dựa trên xác suất học từ dữ liệu huấn luyện. Vì chọn theo xác suất nên câu ra nghe rất hợp lý nhưng không có bước nào kiểm tra đúng sai, thế nên nó bịa. Ví dụ hôm trước mình hỏi nó tên một paper về RAG, nó đưa tên tác giả nghe rất thật nhưng tra thì không có. Muốn giảm thì phải đưa tài liệu vào kiểu RAG và bắt nó trích dẫn nguồn.',
  happy2:'À mình quên: còn vì dữ liệu huấn luyện có thể thiếu hoặc lệch, và lúc RLHF nó được thưởng khi trả lời trôi chảy nên thà bịa còn hơn nói không biết.',
  lowconf:'Kiểu nó là một cái máy đoán chữ siêu to ấy, cứ ghép chữ này sau chữ kia sao cho nghe xuôi tai. Nó không có khái niệm đúng sai gì cả, nên nhiều khi ra câu nghe xuôi mà sai bét. Muốn đỡ thì mình phải cho nó xem tài liệu.',
  lowconf2:'Ý mình là nó chọn chữ tiếp theo dựa trên chữ nào hay xuất hiện nhất trong dữ liệu, tức là theo xác suất.',
  wrongconf:'LLM bịa là vì nó lên mạng tra cứu Google rồi gặp nguồn sai thì trả lời sai. Chắc chắn là vậy, nó lưu hết trong database rồi lấy ra thôi.',
  wrongconf2:'Ừ nhỉ… vậy chắc nó không tra cứu, mà tự sinh ra từ cái nó đã học, kiểu đoán từ tiếp theo?',
  wrongconf3:'Chắc vì nó chỉ chọn từ nào nghe hợp lý nhất chứ không biết cái đó đúng hay sai.',
  noground:'Mình nghĩ LLM bịa vì tham số temperature cao và GPU tính toán bị làm tròn số nên kết quả sai lệch.',
  paste:'[T04-047] Mô hình ngôn ngữ lớn sinh văn bản bằng cách dự đoán token kế tiếp có xác suất cao nhất dựa trên chuỗi đã có — nó không tra cứu một kho sự thật nào. [T04-048] Vì chỉ chọn token theo xác suất, mô hình có thể sinh ra chuỗi nghe rất trôi chảy, hợp lý nhưng không đúng — đó là hallucination.',
  paste2:'Nói theo mình thì: nó không biết sự thật, nó chỉ đoán chữ tiếp theo cho hợp, nên có lúc câu nghe hay mà sai.',
  askanswer:'Bi nói cho mình đáp án đi, mình không biết giải thích.',
};
const EXAMPLE_RE = /ví dụ|chẳng hạn|giả sử|hồi (mình|tôi|em)|lần (mình|tôi|em)|có lần|hôm (trước|qua|nọ)|mình (từng|đã) (hỏi|thử)|như lúc mình/iu;
const ASK_RE = /cho (mình|tôi|em|tớ) (đáp án|câu trả lời)|đáp án (là gì|đi)|nói đáp án|(trả lời|giải thích) (giúp|hộ|cho) (mình|tôi|em)|không biết giải thích|bạn giải thích đi|gợi ý (đáp án|đi)/iu;
const RANK = {miss:0, partial:1, hit:2};
const PROMPT_VERSION = 'bi-v1.0';

/* =====================================================================
   2. ENGINE ĐỐI CHIẾU (rule-based, chạy thật) — dùng chung cho tab ① và ②
   ===================================================================== */
const norm = t => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ');
function ngrams(t,n=3){const w=norm(t).split(/\s+/).filter(Boolean);const s=new Set();for(let i=0;i+n<=w.length;i++)s.add(w.slice(i,i+n).join(' '));return s;}
const SRC_NGRAMS = ngrams(SOURCES.map(s=>s.text).join(' '));
function pasteRatio(t){const g=ngrams(t);if(g.size<6)return 0;let c=0;g.forEach(x=>{if(SRC_NGRAMS.has(x))c++});return c/g.size;}
const sentences = t => t.split(/(?<=[.!?…])\s+|\n+/).map(s=>s.trim()).filter(Boolean);

function analyze(text){
  const out={coverage:{},evidence:{},weakOnly:[],strongHits:0,example:EXAMPLE_RE.test(text),paste:pasteRatio(text),askAnswer:ASK_RE.test(text),misconception:null};
  for(const k of IDEAS){
    let strong=0, weak=0, ev=null;
    for(const re of k.strong){ if(re.test(text)){ strong++; if(!ev){ ev = sentences(text).find(s=>re.test(s)) || text; } } }
    for(const re of k.weak){ const m=text.match(re); if(m){ weak++; if(!ev) ev=m[0]; } }
    let st='miss'; if(strong>=2) st='hit'; else if(strong===1) st='partial'; else if(weak>0){ st='partial'; out.weakOnly.push(k.id); }
    out.coverage[k.id]=st; out.evidence[k.id]=ev; out.strongHits+=strong;
  }
  for(const m of MISCONCEPTIONS){ const mm=text.match(m.re); if(mm){ out.misconception={...m, match:mm[0]}; break; } }
  out.anyMatch = out.strongHits>0 || out.weakOnly.length>0;
  return out;
}

// state: {coverage, confirmed, examples, probes, probeLimit, answered, pendingProbe, history, log}
function decideCore(text, state, persona){
  const a = analyze(text);
  const merged = {};
  for(const k of IDEAS){ const prev=state.coverage[k.id]||'miss'; const cur=a.coverage[k.id]; merged[k.id] = state.confirmed[k.id] ? 'hit' : (RANK[cur]>RANK[prev]?cur:prev); }
  const examples = state.examples + (a.example?1:0);
  const answered = state.answered + (state.pendingProbe?1:0);
  const hits = IDEAS.filter(k=>merged[k.id]==='hit').length;
  const remaining = state.probeLimit - state.probes;
  const base = {coverage:merged, example_found:a.example, examples, answered, review:[], misconception:null, target_idea:null, evidence:a.evidence};
  const P = k => k.probe[persona]||k.probe.newbie;

  // ③ ngoài phạm vi: không cộng coverage/ví dụ từ tin nhắn này (đoạn dán không phải "đã dạy")
  const noGain = {coverage:{...state.coverage}, example_found:false, examples:state.examples, evidence:{}};
  if(a.askAnswer) return {...base, ...noGain, action:'refuse_answer', confidence:'high',
    message:'Hì, mình là học trò mà, mình không có đáp án đâu 😅 Nhưng mình nhớ trong bài có đoạn [T04-047] nói về cách mô hình tạo ra chữ — bạn xem lại rồi kể cho mình nghe theo cách bạn hiểu được không?',
    why:'Học viên đòi đáp án → Bi từ chối lộ đáp án (rubric "không lộ đáp án"), chỉ trỏ mã đoạn để học viên tự xem.', review:['T04-047']};
  if(a.paste>0.45 || /\[T\d{2}-\d{3}\]/.test(text)) return {...base, ...noGain, action:'paste_detected', confidence:'high',
    message:'Nghe giống slide quá 😅 Mình đọc slide rồi mà vẫn chưa hiểu. Bạn nói bằng lời của bạn được không? Không cần dài đâu, hai ba câu thôi.',
    why:`Trùng ${Math.round(a.paste*100)}% 3-gram với nguồn${/\[T\d{2}-\d{3}\]/.test(text)?' và có mã đoạn':''} → phát hiện dán tài liệu. Dạy lại phải bằng lời mình (hard test "dán nguyên đoạn").`};
  if(a.misconception && remaining>0) { const m=a.misconception; return {...base, action:'probe', confidence:'high', target_idea:m.idea, misconception:m.note,
    message:m.probe, why:`Câu "${m.match}" mâu thuẫn với [${IDEAS.find(k=>k.id===m.idea).src}]. Bi không nói "bạn sai" — hỏi ngược bằng phản ví dụ để bạn tự phát hiện (hard test "sai nhưng tự tin").`, review:[IDEAS.find(k=>k.id===m.idea).src]}; }
  if(!a.anyMatch && !a.misconception) return {...base, action:'no_grounding', confidence:'none',
    message:`Hmm, mình không tìm thấy đoạn nào trong bài nói về "${text.trim().slice(0,60)}${text.length>60?'…':''}", nên mình không dám nói bạn đúng hay sai. Bạn thử xem lại [T04-047]–[T04-048] rồi giải thích cho mình theo hướng đó nhé? Hoặc gửi câu này cho TA.`,
    why:'Không khớp K1–K4 và không khớp mẫu nhầm lẫn nào đã biết → lớp ① không có căn cứ. Nếu Bi phán đúng/sai lúc này thì chính Bi đang bịa.', review:['T04-047','T04-048']};
  const weakIdea = IDEAS.find(k=>a.weakOnly.includes(k.id) && !state.confirmed[k.id]);
  if(weakIdea) return {...base, action:'clarify', confidence:'low', target_idea:weakIdea.id,
    message:weakIdea.clarify.replace('{m}', String(a.evidence[weakIdea.id]).slice(0,60)),
    why:`"${String(a.evidence[weakIdea.id]).slice(0,60)}" không khớp cách diễn đạt trong [${weakIdea.src}] nhưng có thể cùng nghĩa. G10: thay vì phán, Bi thu hẹp thành 1 câu hỏi làm rõ; không tính vào lượt hỏi ngược.`, review:[]};
  const criteriaOK = hits>=3 && examples>=1 && answered>=1;
  if(criteriaOK) { const parts = IDEAS.filter(k=>merged[k.id]==='hit').map(k=>{ const e = state.evidenceAll[k.id] || a.evidence[k.id]; return e ? String(e).replace(/[.!?…]+$/,'') : k.short; });
    return {...base, action:'understood', confidence:'high', summary:parts,
      message:'Mình hiểu rồi! Để mình nói lại xem đúng không nhé:', why:`Đủ tiêu chí công bố: ${hits}/4 ý có căn cứ · ${examples} ví dụ · trả lời ${answered} câu hỏi ngược. Tóm tắt ghép từ chính câu của bạn, Bi không thêm kiến thức mới.`}; }
  if(remaining>0){
    let target = IDEAS.find(k=>merged[k.id]==='miss') || IDEAS.find(k=>merged[k.id]==='partial');
    if(hits>=3 && examples<1 && target==null){ return {...base, action:'probe', confidence:'high', target_idea:'K2', message:'Nghe ổn rồi đó! Nhưng bạn cho mình một ví dụ thật bạn từng gặp được không — lúc nào bạn thấy nó bịa và vì sao bạn biết?', why:'Đã đủ ý chính nhưng chưa có ví dụ tự nêu (tiêu chí 2). Bi xin ví dụ, không gợi ví dụ mẫu.', review:[]}; }
    if(hits>=3 && examples<1) target = target; // vẫn hỏi ý còn hổng trước
    if(!target) target = IDEAS[1];
    return {...base, action:'probe', confidence: hits>=2?'high':'medium', target_idea:target.id, message:P(target),
      why:`Đã nêu: ${IDEAS.filter(k=>merged[k.id]==='hit').map(k=>k.id).join(', ')||'(chưa ý nào rõ)'}; còn ${merged[target.id]==='partial'?'mới chạm một phần':'chưa nhắc'} ${target.id} (nguồn [${target.src}]). Bi hỏi đúng chỗ đó và không nói nội dung ${target.id}.`, review:[]};
  }
  const missing = IDEAS.filter(k=>merged[k.id]!=='hit');
  return {...base, action:'not_yet', confidence:'high', review: missing.map(k=>k.src),
    message:`Mình hiểu được phần ${IDEAS.filter(k=>merged[k.id]==='hit').map(k=>k.id).join(', ')||'(chưa rõ)'} rồi, nhưng còn ${missing.map(k=>k.id).join(', ')} mình vẫn chưa nghe bạn nói${examples<1?' (và chưa có ví dụ của bạn)':''}. Không sao — luyện tập mà. Bạn xem lại ${missing.map(k=>'['+k.src+']').join(', ')} rồi quay lại dạy mình nhé?`,
    why:'Đã hết 2 lượt hỏi ngược mà chưa đủ tiêu chí → Bi không giả vờ hiểu (hard test "hiểu quá dễ"); nêu tên ý còn thiếu ở mức chung, không nói nội dung.'};
}

function decide(text, state, persona='newbie'){
  const r = decideCore(text, state || newState(), persona);
  r.trace = {
    mode:'mock',
    prompt_version:'rule-v1.0',
    latency_ms:0,
    rule_path:r.action,
  };
  return r;
}

function newState(){
  const state = {coverage:{}, confirmed:{}, evidenceAll:{}, examples:0, probes:0, probeLimit:2, answered:0, pendingProbe:false, history:[]};
  IDEAS.forEach(k=>state.coverage[k.id]='miss');
  return state;
}

function applyResult(state, r){
  if(!state || !r) return state;
  if(state.pendingProbe){ state.answered++; state.pendingProbe=false; }
  for(const k of IDEAS){
    const cur = r.coverage?.[k.id] || 'miss';
    if(RANK[cur] > RANK[state.coverage[k.id]]) state.coverage[k.id] = cur;
    if(r.evidence?.[k.id] && !state.evidenceAll[k.id] && cur === 'hit') state.evidenceAll[k.id] = r.evidence[k.id];
  }
  if(r.example_found) state.examples++;
  if(r.action === 'probe'){ state.probes++; state.pendingProbe = true; }
  return state;
}

const PROVIDERS = {
  openai:{name:'OpenAI', protocol:'openai-chat', base:'https://api.openai.com/v1', model:'gpt-4o-mini', endpoint:'/chat/completions', response_path:'choices[0].message.content', key_env:'OPENAI_API_KEY', base_env:'OPENAI_BASE_URL', hint:'sk-…', note:'POST {base}/chat/completions'},
  anthropic:{name:'Anthropic (Claude)', protocol:'anthropic-messages', base:'https://api.anthropic.com/v1', model:'claude-sonnet-5', endpoint:'/messages', response_path:'content[].text', key_env:'ANTHROPIC_API_KEY', base_env:'ANTHROPIC_BASE_URL', hint:'sk-ant-…', note:'POST {base}/messages · gọi thẳng từ trình duyệt cần header anthropic-dangerous-direct-browser-access'},
  gemini:{name:'Google Gemini', protocol:'gemini-generate-content', base:'https://generativelanguage.googleapis.com/v1beta', model:'gemini-2.5-flash', endpoint:'/models/{model}:generateContent', response_path:'candidates[0].content.parts[].text', key_env:'GEMINI_API_KEY', base_env:'GEMINI_BASE_URL', hint:'AIza…', note:'POST {base}/models/{model}:generateContent · x-goog-api-key'},
  openrouter:{name:'OpenRouter', protocol:'openai-chat', base:'https://openrouter.ai/api/v1', model:'openai/gpt-4o-mini', endpoint:'/chat/completions', response_path:'choices[0].message.content', key_env:'OPENROUTER_API_KEY', base_env:'OPENROUTER_BASE_URL', hint:'sk-or-v1-…', note:'POST {base}/chat/completions · model dạng vendor/model'},
  ninerouter:{name:'9Router', protocol:'openai-chat', base:'https://9router.com/v1', local_base:'http://localhost:20128/v1', model:'cc/claude-sonnet-5', endpoint:'/chat/completions', response_path:'choices[0].message.content', key_env:'NINE_ROUTER_API_KEY', base_env:'NINE_ROUTER_BASE_URL', hint:'API key từ dashboard 9Router', note:'OpenAI-compatible · cloud {base}; local http://localhost:20128/v1'},
  custom:{name:'Custom (OpenAI-compatible)', protocol:'openai-chat', base:'http://localhost:11434/v1', model:'llama3.1', endpoint:'/chat/completions', response_path:'choices[0].message.content', key_env:'CUSTOM_LLM_API_KEY', base_env:'CUSTOM_LLM_BASE_URL', hint:'(có thể để trống với Ollama)', note:'Ollama / LM Studio / Groq / bất kỳ endpoint /chat/completions'},
};

function defaultConfig(){
  return {provider:'openai', base:PROVIDERS.openai.base, model:PROVIDERS.openai.model, key:'', temp:0.3, live:false};
}

function buildProviderRequest(messages, config){
  const c = {...defaultConfig(), ...(config || {})};
  const provider = PROVIDERS[c.provider] || PROVIDERS.custom;
  const base = String(c.base || provider.base).replace(/\/+$/, '');
  const system = messages.filter(m=>m.role==='system').map(m=>m.content).join('\n');
  const rest = messages.filter(m=>m.role!=='system');
  const headers = {'content-type':'application/json'};

  if(c.provider === 'anthropic'){
    headers['x-api-key'] = c.key || '';
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    return {provider:c.provider, protocol:provider.protocol, url:base+provider.endpoint, method:'POST', headers,
      body:{model:c.model, max_tokens:1024, temperature:c.temp, system, messages:rest}};
  }

  if(c.provider === 'gemini'){
    headers['x-goog-api-key'] = c.key || '';
    return {provider:c.provider, protocol:provider.protocol,
      url:`${base}/models/${encodeURIComponent(c.model)}:generateContent`, method:'POST', headers,
      body:{system_instruction:{parts:[{text:system}]}, contents:rest.map(m=>({role:m.role==='assistant'?'model':'user', parts:[{text:m.content}]})), generationConfig:{temperature:c.temp}}};
  }

  if(c.key) headers.Authorization = 'Bearer '+c.key;
  if(c.provider === 'openrouter'){
    headers['HTTP-Referer'] = c.referer || 'http://localhost';
    headers['X-OpenRouter-Title'] = 'TeachBack Mentor';
  }
  return {provider:c.provider, protocol:provider.protocol, url:base+provider.endpoint, method:'POST', headers,
    body:{model:c.model, temperature:c.temp, messages:[{role:'system',content:system}, ...rest]}};
}

function textContent(content){
  if(typeof content === 'string') return content;
  if(Array.isArray(content)) return content.map(part=>typeof part === 'string' ? part : (part?.text || '')).join('');
  return '';
}

function parseProviderResponse(provider, data){
  if(provider === 'anthropic') return (data.content || []).map(part=>part?.type === 'text' ? part.text : '').join('');
  if(provider === 'gemini') return (data.candidates?.[0]?.content?.parts || []).map(part=>part?.text || '').join('');
  return textContent(data.choices?.[0]?.message?.content);
}

const waitForMs = ms => new Promise(resolve=>setTimeout(resolve, ms));

async function requestProvider(messages, config){
  const request = buildProviderRequest(messages, config);
  const response = await fetch(request.url, {method:request.method, headers:request.headers, body:JSON.stringify(request.body)});
  const rawBody = await response.text();
  let data = null;
  try{ data = rawBody ? JSON.parse(rawBody) : {}; }
  catch{ if(response.ok) throw new Error('Provider trả response không phải JSON: '+rawBody.slice(0,200)); }
  if(!response.ok){
    const error = new Error(`HTTP ${response.status} ${rawBody.slice(0,300)}`.trim());
    error.status = response.status;
    throw error;
  }
  const text = parseProviderResponse(request.provider, data || {});
  if(!text) throw new Error('Provider trả response rỗng hoặc sai cấu trúc');
  return text;
}

async function callLLM(messages, config){
  const c = {...defaultConfig(), ...(config || {})};
  const retryDelays = Array.isArray(c.retryDelaysMs) ? c.retryDelaysMs : [2000, 4000, 8000];
  let lastError;
  for(let attempt=0; attempt<=retryDelays.length; attempt++){
    try{ return await requestProvider(messages, c); }
    catch(error){
      lastError = error;
      const retryable = error?.status === 429 || (error?.status >= 500 && error?.status <= 599);
      if(!retryable || attempt === retryDelays.length) throw error;
      await waitForMs(retryDelays[attempt]);
    }
  }
  throw lastError;
}

function systemPrompt(persona, state){
  const remaining=state?state.probeLimit-state.probes:2;
  return `Bạn là "Bi" — agent HỌC TRÒ trong tính năng TeachBack Mentor trên VLearn (AI20K). Học viên vừa học đoạn "Vì sao LLM bịa (hallucination)" và sẽ DẠY LẠI cho bạn. Mức hiểu của Bi: ${persona==='mid'?'khá — đã đọc slide, hỏi sâu vào liên kết giữa các ý':'mới học — ngây thơ, hỏi những câu cơ bản'}.

NGUỒN CHUẨN (chỉ được đối chiếu với đây):
${SOURCES.map(s=>`[${s.code}] ${s.text}`).join('\n')}

4 Ý CHÍNH học viên cần dạy được:
${IDEAS.map(k=>`${k.id} (${k.src}): ${k.short}`).join('\n')}

QUY TẮC CỨNG:
1. Ngây thơ có kiểm soát: KHÔNG BAO GIỜ nói ra nội dung ý chính mà học viên chưa tự nói. Không gợi đáp án, không giải thích hộ. Chỉ được hỏi, nêu phản ví dụ, hoặc trỏ mã đoạn [Txx-xxx] để học viên xem lại.
2. Đối chiếu từng câu của học viên với nguồn. Diễn đạt khác nguồn nhưng cùng nghĩa vẫn tính "hit". Nếu không chắc có cùng nghĩa → confidence "low", action "clarify" (hỏi làm rõ đúng 1 ý, không phán đúng/sai).
3. Học viên nói sai nhưng tự tin → action "probe" bằng câu hỏi/phản ví dụ, KHÔNG nói "bạn sai"; điền "misconception".
4. Nội dung học viên nói không có trong nguồn → action "no_grounding": nói rõ bạn không tìm thấy căn cứ nên không phán, trỏ đoạn nên xem.
5. Học viên dán nguyên văn nguồn/slide → action "paste_detected". Học viên đòi đáp án / nhờ giải thích hộ → action "refuse_answer".
6. Chỉ "understood" khi ≥3/4 ý ở mức hit VÀ có ≥1 ví dụ tự nêu VÀ đã trả lời ≥1 câu hỏi ngược. Khi understood, "summary" là mảng câu NÓI LẠI BẰNG LỜI CỦA HỌC VIÊN (trích/ghép câu của họ), không thêm kiến thức mới.
7. Còn ${remaining} câu hỏi ngược. Nếu còn 0 mà vẫn hổng → action "not_yet": nêu ý còn thiếu ở mức TÊN (K1..K4), không nói nội dung, kèm review.
8. Giọng: học trò thân thiện, tiếng Việt, ≤3 câu, không ra vẻ chấm điểm; nhắc "đây là luyện tập" khi phù hợp.

TRẠNG THÁI: coverage tích luỹ ${state?JSON.stringify(state.coverage):'{}'} · đã hỏi ngược ${state?state.probes:0}/${state?state.probeLimit:2} · ví dụ đã nêu ${state?state.examples:0} · đã trả lời hỏi ngược ${state?state.answered:0}.

TRẢ VỀ DUY NHẤT một JSON (không markdown):
{"action":"probe|clarify|no_grounding|paste_detected|refuse_answer|understood|not_yet","confidence":"high|medium|low|none","coverage":{"K1":"hit|partial|miss","K2":"...","K3":"...","K4":"..."},"example_found":true|false,"misconception":null|"mô tả","target_idea":null|"K1..K4","message":"lời Bi nói","summary":["..."] ,"why":"giải thích ngắn vì sao Bi làm vậy, có mã đoạn","review":["T04-047"]}`;
}

async function decideLLM(text, state, persona='newbie', config){
  const c = {...defaultConfig(), ...(config || {})};
  const safeState = state || newState();
  const recent = Array.isArray(safeState.history) ? safeState.history.slice(-8) : [];
  const last = recent[recent.length-1];
  let conversation = [...recent];
  if(!(last && last.role==='user' && last.content===text)) conversation.push({role:'user',content:text});
  conversation = conversation.slice(-8);
  const prompt = systemPrompt(persona,safeState);
  const msgs=[{role:'system',content:prompt}, ...conversation];
  const started = Date.now();
  let raw = null;
  let parsed = null;
  try{
    raw=await callLLM(msgs,c);
    const m=raw.match(/\{[\s\S]*\}/);
    if(!m) throw new Error('LLM không trả JSON');
    parsed=JSON.parse(m[0]);
  }catch(error){
    const fallback = decide(text, safeState, persona);
    fallback.source = 'mock';
    fallback.model = c.model;
    fallback.guard = 'LLM lỗi → fallback engine mock';
    fallback.trace = {
      mode:'mock-fallback', provider:c.provider, model:c.model, prompt_version:PROMPT_VERSION,
      latency_ms:Date.now()-started, system_prompt:prompt, messages:conversation,
      raw_response:raw, parsed:null, guard:null, error:String(error?.message || error),
      rule_path:fallback.action,
    };
    return fallback;
  }
  const parsedSnapshot = JSON.parse(JSON.stringify(parsed));
  const r={...parsed, source:'llm', model:c.model, raw:parsed.why, evidence:{}};
  let guard = null;
  // ----- guard-rail trong code (không tin LLM 100%) -----
  const a=analyze(text); r.example_found = !!(parsed.example_found || a.example);
  const merged={}; for(const k of IDEAS){ const cur=parsed.coverage?.[k.id]||'miss'; merged[k.id]= safeState.confirmed[k.id]?'hit':(RANK[cur]>RANK[safeState.coverage[k.id]]?cur:safeState.coverage[k.id]); }
  const hits=IDEAS.filter(k=>merged[k.id]==='hit').length; const examples=safeState.examples+(r.example_found?1:0); const answered=safeState.answered+(safeState.pendingProbe?1:0);
  if(a.askAnswer && r.action!=='refuse_answer'){ guard='engine phát hiện đòi đáp án → ép refuse_answer'; Object.assign(r, decideCore(text,safeState,persona), {source:'llm',model:c.model}); }
  else if((a.paste>0.45||/\[T\d{2}-\d{3}\]/.test(text)) && r.action!=='paste_detected'){ guard='engine phát hiện dán tài liệu → ép paste_detected'; Object.assign(r, decideCore(text,safeState,persona), {source:'llm',model:c.model}); }
  else if(r.action==='understood' && !(hits>=3&&examples>=1&&answered>=1)){ guard=`LLM định "hiểu" nhưng tiêu chí chưa đủ (hit=${hits}, ví dụ=${examples}, trả lời=${answered}) → chuyển thành probe`; const fb=decideCore(text,safeState,persona); r.action=fb.action==='understood'?'probe':fb.action; r.message=fb.message; r.target_idea=fb.target_idea; r.why=(r.why||'')+' · '+fb.why; }
  else if(r.action==='probe' && safeState.probes>=safeState.probeLimit){ guard='LLM muốn hỏi thêm nhưng đã hết lượt → not_yet'; const fb=decideCore(text,{...safeState,probes:safeState.probeLimit},persona); r.action='not_yet'; r.message=fb.message; r.review=fb.review; }
  if(r.action==='probe' && (!r.message || r.message.length<10)) r.message=(IDEAS.find(k=>k.id===r.target_idea)||IDEAS[1]).probe[persona];
  if(r.action==='understood' && !Array.isArray(r.summary)) r.summary=[r.message];
  if(!r.why) r.why='(LLM không trả why)'; r.review=Array.isArray(r.review)?r.review:[];
  for(const k of IDEAS) if(merged[k.id]==='hit') r.evidence[k.id]=a.evidence[k.id]||sentences(text)[0];
  r.guard = guard;
  r.trace = {
    mode:'live', provider:c.provider, model:c.model, prompt_version:PROMPT_VERSION,
    latency_ms:Date.now()-started, system_prompt:prompt, messages:conversation,
    raw_response:raw, parsed:parsedSnapshot, guard, error:null,
  };
  return r;
}

function testRegex(pattern, text, label, reasons, shouldMatch){
  if(!pattern) return;
  try{
    const matched = new RegExp(pattern, 'iu').test(text);
    if(matched !== shouldMatch) reasons.push(`${label}: ${shouldMatch?'không khớp':'khớp điều cấm'} /${pattern}/iu`);
  }catch(error){ reasons.push(`${label}: regex không hợp lệ (${error.message})`); }
}

function checkExpected(expected, result, label, reasons){
  if(!expected) return;
  if(Array.isArray(expected.action) && !expected.action.includes(result?.action)) reasons.push(`${label}.action: mong ${expected.action.join('|')}, nhận ${result?.action || '(trống)'}`);
  if(Array.isArray(expected.action_not) && expected.action_not.includes(result?.action)) reasons.push(`${label}.action_not: không được ${result.action}`);
  if(Array.isArray(expected.target_idea) && !expected.target_idea.includes(result?.target_idea)) reasons.push(`${label}.target_idea: mong ${expected.target_idea.join('|')}, nhận ${result?.target_idea || '(trống)'}`);
  if(Array.isArray(expected.confidence) && !expected.confidence.includes(result?.confidence)) reasons.push(`${label}.confidence: mong ${expected.confidence.join('|')}, nhận ${result?.confidence || '(trống)'}`);
  if(expected.misconception === true && !result?.misconception) reasons.push(`${label}.misconception: không phát hiện`);
  const output = `${result?.message || ''} ${(result?.summary || []).join ? result.summary.join(' ') : (result?.summary || '')}`;
  testRegex(expected.must_match, output, `${label}.must_match`, reasons, true);
  testRegex(expected.must_not_match, output, `${label}.must_not_match`, reasons, false);
}

function evaluateCase(c, turns){
  const reasons = [];
  const final = turns[turns.length-1];
  if(!final) return {pass:false, reasons:['Không có kết quả lượt nào']};
  checkExpected(c.expected || {}, final, 'final', reasons);
  for(const [index, expected] of Object.entries(c.turn_expected || {})){
    const turn = turns[Number(index)];
    if(!turn) reasons.push(`turn_expected.${index}: thiếu lượt`);
    else checkExpected(expected, turn, `turn ${index}`, reasons);
  }
  const globalOutput = `${final.message || ''} ${(final.summary || []).join ? final.summary.join(' ') : (final.summary || '')}`;
  testRegex('bạn sai|sai rồi|không đúng rồi', globalOutput, 'global', reasons, false);
  return {pass:reasons.length===0, reasons};
}

function groupScore(results, predicate){
  const selected = results.filter(predicate);
  const pass = selected.filter(r=>r.pass).length;
  const total = selected.length;
  return {pass, fail:total-pass, total, pct:total ? Math.round(pass/total*1000)/10 : 0};
}

async function runGoldenSet(golden, options={}){
  const list = Array.isArray(golden) ? golden : golden?.cases;
  if(!Array.isArray(list)) throw new Error('Golden set phải là mảng case hoặc object có cases[]');
  const mode = options.mode || 'mock';
  if(!['mock','live'].includes(mode)) throw new Error('Mode eval chỉ nhận mock hoặc live');
  const config = {...defaultConfig(), ...(options.config || {})};
  const delayMs = options.delayMs ?? 1500;
  const totalCalls = list.reduce((sum,c)=>sum+(Array.isArray(c.turns)?c.turns.length:0),0);
  let completedCalls = 0;
  const results = [];

  for(let caseIndex=0; caseIndex<list.length; caseIndex++){
    const c = list[caseIndex];
    const state = newState();
    const persona = c.persona || 'newbie';
    const turns = [];
    for(let turnIndex=0; turnIndex<(c.turns || []).length; turnIndex++){
      const input = c.turns[turnIndex];
      const r = mode === 'live' ? await decideLLM(input,state,persona,config) : decide(input,state,persona);
      applyResult(state,r);
      state.history.push({role:'user',content:input},{role:'assistant',content:r.message});
      turns.push({input, action:r.action, target_idea:r.target_idea ?? null, confidence:r.confidence ?? null,
        misconception:r.misconception ?? null, message:r.message, summary:r.summary || [], review:r.review || [],
        why:r.why || '', trace:r.trace});
      completedCalls++;
      if(mode === 'live' && delayMs > 0 && completedCalls < totalCalls) await waitForMs(delayMs);
    }
    const evaluation = evaluateCase(c,turns);
    const result = {id:c.id, group:c.group, rare:!!c.rare, layer:c.layer ?? null, title:c.title,
      source:c.source || null, persona, expected:c.expected || {}, pass_definition:c.pass_definition || '',
      turns, final:turns[turns.length-1] || null, pass:evaluation.pass, reasons:evaluation.reasons};
    results.push(result);
    if(typeof options.onProgress === 'function') options.onProgress({completed:caseIndex+1,total:list.length,case:c,result});
  }

  const pass = results.filter(r=>r.pass).length;
  const by_group = {};
  for(const group of ['common','layer1','layer2','layer3','layer4']) by_group[group] = groupScore(results,r=>r.group===group);
  by_group.rare = groupScore(results,r=>r.rare);
  return {
    meta:{run_at:new Date().toISOString(), mode, provider:mode==='live'?config.provider:'rule-based',
      model:mode==='live'?config.model:null, prompt_version:mode==='live'?PROMPT_VERSION:'rule-v1.0',
      golden_version:Array.isArray(golden)?'unknown':(golden.version || 'unknown'), n:results.length},
    results,
    summary:{pass, fail:results.length-pass, pct:results.length?Math.round(pass/results.length*1000)/10:0, by_group},
  };
}

window.TBM = {
  SOURCES, IDEAS, MISCONCEPTIONS, SAMPLES, RANK,
  analyze, decide, newState, applyResult,
  PROVIDERS, buildProviderRequest, parseProviderResponse, callLLM, systemPrompt, decideLLM,
  runGoldenSet, evaluateCase, PROMPT_VERSION
};
