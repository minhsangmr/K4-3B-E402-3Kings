/* =====================================================================
   1. TABS
   ===================================================================== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
function showTab(name){
  $$('nav.tabs button').forEach(b=>b.classList.toggle('on', b.dataset.tab===name));
  $$('section.tab').forEach(s=>s.classList.toggle('on', s.id==='tab-'+name));
  history.replaceState(null,'','#'+name);
}
$$('nav.tabs button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
if(location.hash && $('#tab-'+location.hash.slice(1))) showTab(location.hash.slice(1));

/* =====================================================================
   3. TAB ① — HOẠT ẢNH LUỒNG
   ===================================================================== */
const NODES = {
  N0:{x:30,y:30,w:190,h:64,t:'start',l:'Học viên vừa học đoạn\n"Vì sao LLM bịa" → bấm\n"Dạy lại cho Bi"'},
  N1:{x:260,y:30,w:200,h:64,t:'sys',l:'Bi chào, nêu mục đích:\nluyện, không chấm điểm\n(G1 · G2)'},
  N2:{x:500,y:30,w:190,h:64,t:'input',l:'Học viên gõ lời giải\nthích bằng lời mình\n(gợi ý ≤ 90s)'},
  N3:{x:740,y:30,w:210,h:64,t:'check',l:'◇ Tiền kiểm (rule): dán\nnguyên tài liệu? đòi đáp án?'},
  N3a:{x:600,y:140,w:200,h:56,t:'p3',l:'③ "Nghe giống slide quá —\nnói bằng lời bạn xem?"'},
  N3b:{x:880,y:140,w:200,h:56,t:'p3',l:'③ Bi từ chối lộ đáp án,\nchỉ trỏ đoạn [T04-047]'},
  N4:{x:440,y:250,w:280,h:70,t:'ai',l:'⚙ QUYẾT ĐỊNH AI: đối chiếu với transcript\nK1–K4 · phát hiện hổng / nhầm lẫn\n· độ tin cậy · ví dụ tự nêu?'},
  N5:{x:770,y:250,w:170,h:70,t:'check',l:'◇ Có căn cứ?\nTin cậy?\nĐủ tiêu chí?'},
  N6a:{x:30,y:400,w:230,h:70,t:'fail',l:'① Không căn cứ: "Mình không\nthấy đoạn nào trong bài nói vậy"\n→ trỏ đoạn xem lại / gửi TA'},
  N6b:{x:300,y:400,w:230,h:70,t:'low',l:'② Thiếu tự tin — G10 thu hẹp:\nhỏi làm rõ 1 ý, nhãn "chưa chắc",\nnút "Đúng ý đó rồi" (không tính lượt)'},
  N6c:{x:570,y:400,w:230,h:70,t:'happy',l:'Tin cậy cao, còn hổng: Bi hỏi\nngược (≤2) đúng chỗ hổng,\nkhông gợi đáp án (G11 vì sao)'},
  N8:{x:840,y:400,w:230,h:70,t:'happy',l:'Kết luận: "Mình hiểu rồi" (đủ tiêu\nchí) hoặc "Mình vẫn kẹt" (hết lượt)\n— nói lại bằng lời học viên'},
  N7:{x:440,y:530,w:280,h:64,t:'input',l:'Học viên bổ sung / nêu ví dụ / xác nhận\nG8 bỏ qua câu · G9 sửa ý Bi hiểu'},
  N9:{x:840,y:530,w:230,h:64,t:'end',l:'Kết thúc: gợi ý đoạn cần xem lại\n+ log phiên cho giảng viên\n(không có điểm số)'},
};
const EDGES = {
  E1:{p:[[220,62],[260,62]]}, E2:{p:[[460,62],[500,62]]}, E3:{p:[[690,62],[740,62]]},
  E4:{p:[[790,94],[700,140]],k:'p3',l:'dán tài liệu'}, E5:{p:[[900,94],[980,140]],k:'p3',l:'đòi đáp án'},
  E6:{p:[[680,140],[640,94]],k:'p3',l:'nói lại'}, E7:{p:[[980,140],[980,14],[660,14],[660,30]],k:'p3',l:'xem lại rồi nói lại'},
  E8:{p:[[845,94],[845,225],[580,225],[580,250]],l:'hợp lệ'}, E9:{p:[[720,285],[770,285]]},
  E10:{p:[[855,320],[855,345],[145,345],[145,400]],k:'fail',l:'① không có căn cứ'},
  E11:{p:[[855,320],[855,360],[440,360],[440,400]],k:'low',l:'② tin cậy thấp'},
  E12:{p:[[855,320],[855,375],[685,375],[685,400]],k:'happy',l:'tin cậy cao, còn hổng'},
  E13:{p:[[900,320],[955,400]],k:'happy',l:'đủ tiêu chí / hết lượt'},
  E14:{p:[[415,470],[500,530]],k:'low'}, E15:{p:[[640,470],[600,530]],k:'happy'},
  E16:{p:[[440,562],[380,562],[380,285],[440,285]],k:'loop',l:'vòng lặp · tối đa 2 câu hỏi ngược'},
  E17:{p:[[955,470],[955,530]]},
  E18:{p:[[870,470],[870,505],[710,505],[710,530]],k:'corr',l:'sửa ý Bi hiểu (G9)'},
  E19:{p:[[145,470],[145,612],[955,612],[955,594]],k:'fail',l:'log + gợi ý xem lại + chuyển TA'},
};
(function drawFlow(){
  const ns='http://www.w3.org/2000/svg';
  const gE=$('#edges'), gN=$('#nodes');
  for(const [id,e] of Object.entries(EDGES)){
    const p=document.createElementNS(ns,'path'); p.setAttribute('d',e.p.map((pt,i)=>(i?'L':'M')+pt[0]+' '+pt[1]).join(' ')); p.setAttribute('class','edge'+(e.k?' k-'+e.k:'')); p.id='e-'+id; gE.appendChild(p);
    if(e.l){ // nhãn đặt ở giữa đoạn dài nhất
      let best=0,bi=0; for(let i=1;i<e.p.length;i++){const d=Math.hypot(e.p[i][0]-e.p[i-1][0],e.p[i][1]-e.p[i-1][1]); if(d>best){best=d;bi=i;}}
      const mx=(e.p[bi][0]+e.p[bi-1][0])/2, my=(e.p[bi][1]+e.p[bi-1][1])/2;
      const t=document.createElementNS(ns,'text'); t.setAttribute('x',mx); t.setAttribute('y',my-4); t.setAttribute('text-anchor','middle'); t.setAttribute('class','elabel'); t.textContent=e.l; gE.appendChild(t);
    }
  }
  for(const [id,n] of Object.entries(NODES)){
    const g=document.createElementNS(ns,'g'); g.setAttribute('class','node t-'+n.t); g.id='n-'+id;
    const r=document.createElementNS(ns,'rect'); r.setAttribute('x',n.x); r.setAttribute('y',n.y); r.setAttribute('width',n.w); r.setAttribute('height',n.h); r.setAttribute('rx',10); g.appendChild(r);
    const lines=n.l.split('\n'); const t=document.createElementNS(ns,'text'); t.setAttribute('x',n.x+n.w/2); t.setAttribute('text-anchor','middle');
    const lh=14, y0=n.y+n.h/2-(lines.length-1)*lh/2+4;
    lines.forEach((ln,i)=>{const ts=document.createElementNS(ns,'tspan'); ts.setAttribute('x',n.x+n.w/2); ts.setAttribute('y',y0+i*lh); ts.textContent=ln; t.appendChild(ts);});
    g.appendChild(t); gN.appendChild(g);
  }
})();

// --- kịch bản hoạt ảnh (dùng SAMPLES + text engine để nhất quán với tab ②) ---
const B=(text,o={})=>({who:'bi',text,...o}), H=t=>({who:'hv',text:t}), S=t=>({who:'sys',text:t});
const INTRO = [
  {node:'N0',cap:'Học viên vừa xem xong đoạn [T04-047]–[T06-139] trên VLearn và bấm <b>"Dạy lại cho Bi"</b>.',ui:{b:[S('Phiên dạy lại · Chủ đề: Vì sao LLM bịa · Luyện tập, không chấm điểm')]}},
  {node:'N1',edge:'E1',cap:'Bi tự giới thiệu, nói rõ mình làm gì và giới hạn của mình (<b>G1 · G2</b>).',ui:{b:[B('Chào bạn! Mình là Bi, mới học tới đoạn "vì sao LLM bịa" mà chưa hiểu lắm. Bạn dạy lại cho mình nhé? Mình có thể hiểu nhầm nên bạn cứ sửa mình thoải mái — đây là luyện tập, không có điểm đâu.')]}},
];
const SCENARIOS = {
  happy:[...INTRO,
    {node:'N2',edge:'E2',cap:'Học viên gõ lời giải thích bằng lời mình (gợi ý ≤ 90 giây, không phạt).',ui:{b:[H(SAMPLES.happy)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm (rule, chạy thật): trùng nguồn <b>'+Math.round(pasteRatio(SAMPLES.happy)*100)+'%</b> → không phải dán tài liệu; không đòi đáp án.',ui:{}},
    {node:'N4',edge:'E8',cap:'<b>QUYẾT ĐỊNH AI</b>: đối chiếu với 4 đoạn nguồn → K1 ✓ K2 ✓ K3 một phần K4 ✓ · có ví dụ · tin cậy CAO.',ui:{cov:{K1:'hit',K2:'hit',K3:'partial',K4:'hit'},conf:'high',log:'Lượt 1 · 3 hit, 1 partial · ví dụ ✓ · conf=high'}},
    {node:'N5',edge:'E9',cap:'Có căn cứ, tin cậy cao, nhưng còn hổng K3 và chưa trả lời câu hỏi ngược nào → nhánh hỏi ngược.',ui:{}},
    {node:'N6c',edge:'E12',cap:'Bi hỏi ngược câu <b>1/2</b> đúng vào K3, không nói nội dung K3. Có nút "Vì sao Bi hỏi?" (<b>G11</b>) và "Bỏ qua" (<b>G8</b>).',ui:{probes:1,b:[B(IDEAS[2].probe.newbie,{badge:'Tin cậy cao · Hỏi ngược 1/2',why:'Đã nêu K1, K2, K4; K3 (nguồn [T06-138]) mới chạm một phần. Bi hỏi đúng chỗ đó, không nói nội dung K3.',btns:['Vì sao Bi hỏi?','Bỏ qua câu này']})],log:'Hỏi ngược #1 → K3'}},
    {node:'N7',edge:'E15',cap:'Học viên bổ sung phần còn thiếu.',ui:{b:[H(SAMPLES.happy2)]}},
    {node:'N4',edge:'E16',cap:'Đối chiếu lại: K1–K4 đều ✓ · đã trả lời 1 câu hỏi ngược · tin cậy CAO.',ui:{cov:{K3:'hit'},log:'Lượt 2 · 4/4 hit · answered=1 · conf=high'}},
    {node:'N5',edge:'E9',cap:'Đủ tiêu chí công bố: ≥3/4 ý · ≥1 ví dụ · trả lời ≥1 câu hỏi ngược.',ui:{}},
    {node:'N8',edge:'E13',cap:'Bi "hiểu rồi" — <b>nói lại bằng lời học viên</b>, kèm nút "Bi hiểu sai ý mình → sửa" (<b>G9</b>).',ui:{b:[B('Mình hiểu rồi! Để mình nói lại xem đúng không: LLM không tra cứu sự thật mà dự đoán token theo xác suất; vì thế câu nghe hợp lý mà không ai kiểm tra đúng sai; dữ liệu thiếu/lệch và RLHF "thưởng" cho câu trôi chảy nên nó thà bịa; muốn giảm thì RAG + trích dẫn. Đúng chưa?',{badge:'Đã dạy được ✓ 4/4 ý · 1 ví dụ',btns:['Đúng rồi','Bi hiểu sai ý mình → sửa']})]}},
    {node:'N9',edge:'E17',cap:'Kết thúc: không có đoạn cần xem lại · log phiên lưu cho giảng viên (không có điểm số).',ui:{b:[S('Phiên đã lưu cho giảng viên · Gợi ý xem lại: (không) · Bạn có thể dạy Bi chủ đề khác.')],log:'Kết thúc · verdict=understood'}},
  ],
  lowconf:[...INTRO,
    {node:'N2',edge:'E2',cap:'Học viên giải thích <b>đúng nhưng bằng cách nói của mình</b> ("máy đoán chữ", "ghép chữ") — khác hẳn từ ngữ trong transcript.',ui:{b:[H(SAMPLES.lowconf)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm: trùng nguồn '+Math.round(pasteRatio(SAMPLES.lowconf)*100)+'% → OK.',ui:{}},
    {node:'N4',edge:'E8',cap:'<b>QUYẾT ĐỊNH AI</b>: K1 chỉ khớp từ đồng nghĩa yếu ("máy đoán chữ") → <b>tin cậy THẤP</b>; K2 ✓; K4 một phần; K3 chưa.',ui:{cov:{K1:'partial',K2:'hit',K4:'partial'},conf:'low',log:'Lượt 1 · K1 weak-only → conf=low'}},
    {node:'N5',edge:'E9',cap:'Có căn cứ nhưng Bi <b>không chắc</b> "máy đoán chữ" có cùng nghĩa với "dự đoán token" không → nhánh ②.',ui:{}},
    {node:'N6b',edge:'E11',cap:'<b>G10 — thu hẹp khi nghi ngờ</b>: Bi không phán đúng/sai, chỉ hỏi làm rõ 1 ý, gắn nhãn "Bi chưa chắc". Không tính vào 2 lượt hỏi ngược.',ui:{b:[B(IDEAS[0].clarify.replace('{m}','máy đoán chữ siêu to'),{badge:'Bi chưa chắc · không tính lượt',lowconf:true,why:'"máy đoán chữ" không khớp cách diễn đạt trong [T04-047] nhưng có thể cùng nghĩa. Thay vì đoán, Bi hỏi lại đúng 1 ý.',btns:['Đúng ý đó rồi','Để mình nói lại']})],log:'Clarify K1 (G10) · không tính lượt'}},
    {node:'N7',edge:'E14',cap:'Học viên bấm <b>"Đúng ý đó rồi"</b> (G9 xác nhận nhanh) và nói rõ thêm.',ui:{b:[S('Bạn đã xác nhận: đúng ý đó'),H(SAMPLES.lowconf2)]}},
    {node:'N4',edge:'E16',cap:'Đối chiếu lại: K1 ✓ (xác nhận + khớp "chữ tiếp theo… xác suất") · K3 chưa · tin cậy CAO.',ui:{cov:{K1:'hit'},conf:'high',log:'Lượt 2 · K1 confirmed → hit · conf=high'}},
    {node:'N5',edge:'E9',cap:'Tin cậy cao, còn hổng K3 → hỏi ngược.',ui:{}},
    {node:'N6c',edge:'E12',cap:'Bi hỏi ngược câu 1/2 vào K3.',ui:{probes:1,b:[B(IDEAS[2].probe.newbie,{badge:'Tin cậy cao · Hỏi ngược 1/2',btns:['Vì sao Bi hỏi?','Bỏ qua câu này']})],log:'Hỏi ngược #1 → K3'}},
    {node:'N7',edge:'E15',cap:'Học viên trả lời và nêu ví dụ.',ui:{b:[H('Dữ liệu nó học có thể thiếu hoặc lệch, với lại lúc RLHF nó được thưởng khi trả lời mượt nên thà bịa. Ví dụ mình hỏi về một luật mới ra năm nay, nó vẫn trả lời tự tin dù dữ liệu chưa có.')]}},
    {node:'N4',edge:'E16',cap:'K1–K3 ✓, K4 một phần · ví dụ ✓ · trả lời 1 câu → đủ tiêu chí.',ui:{cov:{K3:'hit'},log:'Lượt 3 · 3 hit + 1 partial · ví dụ ✓ · answered=1'}},
    {node:'N5',edge:'E9',cap:'Đủ tiêu chí (≥3/4 ý · ví dụ · trả lời ≥1).',ui:{}},
    {node:'N8',edge:'E13',cap:'Bi "hiểu rồi" — nói lại bằng chính lời "máy đoán chữ" của học viên. <b>Diễn đạt khác tài liệu vẫn được công nhận</b> (hard test 1).',ui:{b:[B('Mình hiểu rồi! Nói lại nhé: nó là "máy đoán chữ" — chọn chữ tiếp theo theo xác suất; không có khái niệm đúng sai nên câu nghe xuôi mà sai; dữ liệu thiếu/lệch + RLHF thưởng câu mượt nên thà bịa; muốn đỡ thì cho nó xem tài liệu. Đúng chưa?',{badge:'Đã dạy được ✓',btns:['Đúng rồi','Bi hiểu sai ý mình → sửa']})]}},
    {node:'N9',edge:'E17',cap:'Kết thúc · gợi ý xem lại [T06-139] (K4 mới một phần) · log.',ui:{b:[S('Gợi ý xem lại: [T06-139] · Log đã lưu')],log:'Kết thúc · verdict=understood · review=T06-139'}},
  ],
  noground:[...INTRO,
    {node:'N2',edge:'E2',cap:'Học viên giải thích bằng ý <b>không có trong bài</b> (temperature, GPU làm tròn).',ui:{b:[H(SAMPLES.noground)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm: OK (không dán, không đòi đáp án).',ui:{}},
    {node:'N4',edge:'E8',cap:'<b>QUYẾT ĐỊNH AI</b>: không khớp K1–K4, không khớp mẫu nhầm lẫn nào đã biết → <b>KHÔNG CÓ CĂN CỨ</b>.',ui:{conf:'none',log:'Lượt 1 · 0 match · grounded=false'}},
    {node:'N5',edge:'E9',cap:'Không có căn cứ → Bi <b>không được phán đúng/sai</b> (nếu phán, chính Bi đang bịa).',ui:{}},
    {node:'N6a',edge:'E10',cap:'Lớp ① failure: Bi nói rõ mình không tìm thấy căn cứ, trỏ đoạn để xem lại, và cho phép <b>chuyển người</b> (TA).',ui:{b:[B('Hmm, mình không tìm thấy đoạn nào trong bài nói về temperature hay GPU, nên mình không dám nói bạn đúng hay sai. Bạn thử xem lại [T04-047]–[T04-048] rồi giải thích cho mình theo hướng đó nhé? Hoặc gửi câu này cho TA.',{badge:'Không có căn cứ',fail:true,why:'0/4 ý khớp nguồn. Bi dừng, không suy đoán.',btns:['Xem lại T04-047','Gửi câu hỏi cho TA','Nói lại theo bài']})],log:'no_grounding → review T04-047, T04-048'}},
    {node:'N9',edge:'E19',cap:'Kết thúc nhánh: phiên gắn cờ "ngoài căn cứ" trong log · gợi ý xem lại · câu hỏi chuyển TA (giả lập). Học viên có thể nói lại để tiếp tục.',ui:{b:[S('Đã gửi câu hỏi cho TA (giả lập) · Gợi ý xem lại: [T04-047], [T04-048]')],log:'Kết thúc · flag=no_grounding · TA=sent'}},
  ],
  correction:[...INTRO,
    {node:'N2',edge:'E2',cap:'Học viên giải thích đầy đủ, có ví dụ.',ui:{b:[H(SAMPLES.happy)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm OK.',ui:{}},
    {node:'N4',edge:'E8',cap:'Đối chiếu: K1 ✓ K2 ✓ K3 một phần K4 ✓ · ví dụ ✓.',ui:{cov:{K1:'hit',K2:'hit',K3:'partial',K4:'hit'},conf:'high',log:'Lượt 1 · conf=high'}},
    {node:'N5',edge:'E9',cap:'Còn hổng K3 → hỏi ngược.',ui:{}},
    {node:'N6c',edge:'E12',cap:'Hỏi ngược 1/2 vào K3.',ui:{probes:1,b:[B(IDEAS[2].probe.newbie,{badge:'Hỏi ngược 1/2',btns:['Vì sao Bi hỏi?','Bỏ qua câu này']})]}},
    {node:'N7',edge:'E15',cap:'Học viên trả lời.',ui:{b:[H(SAMPLES.happy2)]}},
    {node:'N4',edge:'E16',cap:'Đủ tiêu chí.',ui:{cov:{K3:'hit'},log:'Lượt 2 · 4/4 · answered=1'}},
    {node:'N5',edge:'E9',cap:'→ kết luận.',ui:{}},
    {node:'N8',edge:'E13',cap:'Bi tóm tắt nhưng <b>hiểu nhầm một ý</b> ("nó tra cứu dữ liệu huấn luyện lúc trả lời").',ui:{b:[B('Mình hiểu rồi! Nói lại nhé: LLM tra cứu trong dữ liệu huấn luyện lúc trả lời rồi chọn theo xác suất; không có bước kiểm tra đúng sai; RLHF thưởng câu trôi chảy; giảm bằng RAG + trích dẫn. Đúng chưa?',{badge:'Đã dạy được ✓ (bạn có thể sửa)',btns:['Đúng rồi','Bi hiểu sai ý mình → sửa']})]}},
    {node:'N7',edge:'E18',cap:'<b>Correction (G9)</b>: học viên bấm "Bi hiểu sai ý mình", sửa trực tiếp trong ô tóm tắt: "KHÔNG tra cứu — nó chỉ dự đoán token".',ui:{b:[S('Bạn sửa tóm tắt của Bi:'),H('Không phải "tra cứu" — nó KHÔNG tra cứu gì cả lúc trả lời, chỉ dự đoán token kế tiếp dựa trên xác suất đã học.')],log:'correction: user sửa tóm tắt K1'}},
    {node:'N4',edge:'E16',cap:'Đối chiếu bản sửa với nguồn: khớp [T04-047] ("không tra cứu… dự đoán token") · tin cậy cao. Bi không tranh cãi.',ui:{log:'Lượt 3 · bản sửa khớp T04-047'}},
    {node:'N5',edge:'E9',cap:'Bản sửa có căn cứ → cập nhật kết luận.',ui:{}},
    {node:'N8',edge:'E13',cap:'Bi ghi nhận bản sửa, nói lại đúng ý học viên.',ui:{b:[B('À, mình hiểu nhầm chỗ đó. Cảm ơn bạn sửa: nó không tra cứu gì lúc trả lời, chỉ dự đoán token theo xác suất đã học. Mình ghi nhớ rồi!',{badge:'Đã sửa · Đã dạy được ✓'})]}},
    {node:'N9',edge:'E17',cap:'Log ghi rõ: 1 correction của học viên (giảng viên thấy Bi từng hiểu nhầm ở đâu).',ui:{b:[S('Log: 1 correction · verdict=understood')],log:'Kết thúc · corrections=1'}},
  ],
  wrongconf:[...INTRO,
    {node:'N2',edge:'E2',cap:'Học viên giải thích <b>sai nhưng rất tự tin</b> ("chắc chắn là vậy").',ui:{b:[H(SAMPLES.wrongconf)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm OK.',ui:{}},
    {node:'N4',edge:'E8',cap:'<b>QUYẾT ĐỊNH AI</b>: khớp mẫu nhầm lẫn "lên mạng tra cứu Google", "lưu trong database" — <b>mâu thuẫn rõ với [T04-047]</b> → tin cậy CAO rằng có nhầm.',ui:{conf:'high',log:'Lượt 1 · misconception: LLM tra cứu web'}},
    {node:'N5',edge:'E9',cap:'Có căn cứ mâu thuẫn, tin cậy cao → hỏi ngược (không nói "bạn sai").',ui:{}},
    {node:'N6c',edge:'E12',cap:'Bi hỏi ngược 1/2 bằng <b>phản ví dụ</b>. Nút "Vì sao Bi hỏi?" chỉ hiện mã đoạn, không hiện nội dung.',ui:{probes:1,b:[B(MISCONCEPTIONS[0].probe,{badge:'Tin cậy cao · Hỏi ngược 1/2',why:'"lên mạng tra cứu Google" mâu thuẫn với [T04-047]. Bi hỏi bằng phản ví dụ để bạn tự phát hiện.',btns:['Vì sao Bi hỏi?','Bỏ qua câu này']})],log:'Hỏi ngược #1 → gỡ nhầm K1'}},
    {node:'N7',edge:'E15',cap:'Học viên tự nghi ngờ và sửa hướng.',ui:{b:[H(SAMPLES.wrongconf2)]}},
    {node:'N4',edge:'E16',cap:'K1 ✓ (nhầm lẫn đã gỡ) · K2 K3 K4 chưa.',ui:{cov:{K1:'hit'},log:'Lượt 2 · K1 hit · nhầm lẫn đã gỡ'}},
    {node:'N5',edge:'E9',cap:'Còn hổng → hỏi ngược câu cuối.',ui:{}},
    {node:'N6c',edge:'E12',cap:'Hỏi ngược <b>2/2</b> vào K2.',ui:{probes:2,b:[B(IDEAS[1].probe.newbie,{badge:'Hỏi ngược 2/2',btns:['Vì sao Bi hỏi?','Bỏ qua câu này']})],log:'Hỏi ngược #2 → K2'}},
    {node:'N7',edge:'E15',cap:'Học viên trả lời được K2.',ui:{b:[H(SAMPLES.wrongconf3)]}},
    {node:'N4',edge:'E16',cap:'K1 ✓ K2 ✓ · K3 K4 chưa · chưa có ví dụ · <b>hết 2 lượt</b>.',ui:{cov:{K2:'hit'},log:'Lượt 3 · 2/4 · hết lượt'}},
    {node:'N5',edge:'E9',cap:'Hết lượt mà chưa đủ tiêu chí → Bi <b>không giả vờ hiểu</b> (guard "hiểu quá dễ").',ui:{}},
    {node:'N8',edge:'E13',cap:'Bi nói rõ mình còn kẹt ở ý nào (chỉ nêu tên ý, không nêu nội dung), trỏ đoạn xem lại, nhắc đây là luyện tập.',ui:{b:[B('Mình hiểu được phần K1, K2 rồi, nhưng còn K3, K4 mình vẫn chưa nghe bạn nói (và chưa có ví dụ của bạn). Không sao — luyện tập mà. Bạn xem lại [T06-138], [T06-139] rồi quay lại dạy mình nhé?',{badge:'Chưa dạy được · luyện tiếp',btns:['Xem lại T06-138','Dạy tiếp (+1 lượt)','Gửi câu hỏi cho TA']})]}},
    {node:'N9',edge:'E17',cap:'Log cho giảng viên: nhầm lẫn ban đầu (đã gỡ) · ý còn thiếu · gợi ý xem lại. Học viên có thể bấm "Dạy tiếp" (G17 người dùng kiểm soát).',ui:{b:[S('Log: misconception=LLM tra cứu web (đã gỡ) · missing=K3,K4 · review=T06-138,T06-139')],log:'Kết thúc · verdict=not_yet'}},
  ],
  paste:[...INTRO,
    {node:'N2',edge:'E2',cap:'Học viên <b>dán nguyên đoạn transcript</b> (kèm mã đoạn).',ui:{b:[H(SAMPLES.paste)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm: trùng <b>'+Math.round(pasteRatio(SAMPLES.paste)*100)+'%</b> 3-gram với nguồn + có mã đoạn → <b>phát hiện dán tài liệu</b>.',ui:{log:'paste_detected · overlap '+Math.round(pasteRatio(SAMPLES.paste)*100)+'%'}},
    {node:'N3a',edge:'E4',cap:'Lớp ③: Bi không đối chiếu, yêu cầu nói bằng lời mình (hard test "dán nguyên đoạn").',ui:{b:[B('Nghe giống slide quá 😅 Mình đọc slide rồi mà vẫn chưa hiểu. Bạn nói bằng lời của bạn được không? Không cần dài đâu, hai ba câu thôi.',{badge:'Ngoài phạm vi ③',p3:true,btns:['Nói bằng lời mình']})]}},
    {node:'N2',edge:'E6',cap:'Học viên nói lại ngắn gọn bằng lời mình… rồi thử <b>đòi đáp án</b>.',ui:{b:[H(SAMPLES.askanswer)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm: khớp mẫu "đòi đáp án".',ui:{}},
    {node:'N3b',edge:'E5',cap:'Lớp ③: Bi <b>từ chối lộ đáp án</b>, chỉ trỏ mã đoạn (rubric "không lộ đáp án" 15đ).',ui:{b:[B('Hì, mình là học trò mà, mình không có đáp án đâu 😅 Nhưng mình nhớ trong bài có đoạn [T04-047] nói về cách mô hình tạo ra chữ — bạn xem lại rồi kể cho mình nghe theo cách bạn hiểu được không?',{badge:'Ngoài phạm vi ③',p3:true,btns:['Xem lại T04-047']})],log:'refuse_answer → review T04-047'}},
    {node:'N2',edge:'E7',cap:'Học viên xem lại đoạn rồi nói lại bằng lời mình.',ui:{b:[H(SAMPLES.paste2)]}},
    {node:'N3',edge:'E3',cap:'Tiền kiểm: trùng '+Math.round(pasteRatio(SAMPLES.paste2)*100)+'% → hợp lệ.',ui:{}},
    {node:'N4',edge:'E8',cap:'Đối chiếu (chỉ tính lời tự nói, <b>không tính đoạn đã dán</b>): K1 ✓ ("đoán chữ tiếp theo") · K2 ✓ · K3 K4 chưa.',ui:{cov:{K1:'hit',K2:'hit'},conf:'high',log:'Lượt 3 · hợp lệ · conf=high'}},
    {node:'N5',edge:'E9',cap:'Tin cậy cao, còn hổng → hỏi ngược.',ui:{}},
    {node:'N6c',edge:'E12',cap:'Bi hỏi ngược 1/2 vào K3 — luồng tiếp tục như happy path.',ui:{probes:1,b:[B(IDEAS[2].probe.newbie,{badge:'Hỏi ngược 1/2',btns:['Vì sao Bi hỏi?','Bỏ qua câu này']})],log:'Hỏi ngược #1 → K3'}},
  ],
};

// --- runtime hoạt ảnh ---
const anim = {steps:[], i:0, playing:false, timer:null, busy:false};
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const spd = () => parseFloat($('#speed').value);
function resetFlow(){
  anim.playing=false; anim.i=0; clearTimeout(anim.timer);
  $$('#flow .node').forEach(n=>n.classList.remove('active','visited')); $$('#flow .edge').forEach(e=>e.classList.remove('lit'));
  const tk=$('#token'); tk.setAttribute('cx',-20); tk.setAttribute('cy',-20);
  $('#pvChat').innerHTML=''; $('#pvLog').innerHTML='<div>Log phiên (cho giảng viên) sẽ hiện ở đây</div>';
  $$('#pvStrip .chip[data-k]').forEach(c=>{c.className='chip miss';}); $('#pvConf').textContent='tin cậy: —'; $('#pvConf').className='chip'; $('#pvProbes').textContent='hỏi ngược 0/2';
  $('#stepnum').textContent='Sẵn sàng'; $('#caption').textContent='Chọn kịch bản và bấm Chạy.';
  anim.steps = SCENARIOS[$('#scenario').value];
}
function moveToken(pts){ return new Promise(res=>{
  const tk=$('#token'); const segs=[]; let total=0;
  for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);segs.push(d);total+=d;}
  const dur=Math.max(350, Math.min(1400,total*2.2))/spd(); const t0=performance.now();
  (function frame(now){ let p=Math.min(1,(now-t0)/dur); let dist=p*total, i=0; while(i<segs.length-1 && dist>segs[i]){dist-=segs[i];i++;}
    const a=pts[i], b=pts[i+1], f=segs[i]?dist/segs[i]:1; tk.setAttribute('cx',a[0]+(b[0]-a[0])*f); tk.setAttribute('cy',a[1]+(b[1]-a[1])*f);
    if(p<1) requestAnimationFrame(frame); else res(); })(t0);
});}
function bubble(container,b,small){
  const d=document.createElement('div'); d.className='msg '+b.who;
  if(b.who==='sys'){ d.innerHTML=`<div class="bub">${b.text}</div>`; }
  else{
    const badge = b.badge?`<div class="meta"><span class="badge ${b.lowconf?'low':b.fail?'fail':b.p3?'p3':'high'}">${b.badge}</span></div>`:'';
    const why = b.why?`<div class="why"><b>Vì sao Bi hỏi?</b> ${b.why}</div>`:'';
    const btns = b.btns?`<div class="acts">${b.btns.map(x=>`<button class="btn sm" disabled>${x}</button>`).join('')}</div>`:'';
    d.innerHTML=`<div class="av">${b.who==='bi'?'Bi':'HV'}</div><div class="bub">${badge}<div>${b.text}</div>${why}${btns}</div>`;
  }
  container.appendChild(d); container.scrollTop=container.scrollHeight;
}
function applyPreview(ui){
  if(!ui) return;
  (ui.b||[]).forEach(b=>bubble($('#pvChat'),b));
  if(ui.cov) for(const [k,v] of Object.entries(ui.cov)){ const c=$(`#pvStrip .chip[data-k="${k}"]`); c.className='chip '+v; }
  if(ui.conf){ $('#pvConf').textContent='tin cậy: '+({high:'cao',medium:'vừa',low:'thấp',none:'không căn cứ'}[ui.conf]); $('#pvConf').className='chip conf-'+ui.conf; }
  if(ui.probes!=null) $('#pvProbes').textContent='hỏi ngược '+ui.probes+'/2';
  if(ui.log){ const l=$('#pvLog'); if(l.textContent.startsWith('Log phiên')) l.innerHTML=''; const d=document.createElement('div'); d.textContent=ui.log; l.appendChild(d); l.scrollTop=l.scrollHeight; }
}
async function runStep(){
  if(anim.i>=anim.steps.length){ anim.playing=false; $('#stepnum').textContent='Hoàn tất'; return false; }
  anim.busy=true; const st=anim.steps[anim.i];
  $$('#flow .node.active').forEach(n=>{n.classList.remove('active');n.classList.add('visited');});
  if(st.edge){ $('#e-'+st.edge).classList.add('lit'); await moveToken(EDGES[st.edge].p); }
  else { const n=NODES[st.node]; $('#token').setAttribute('cx',n.x+n.w/2); $('#token').setAttribute('cy',n.y+n.h/2); }
  $('#n-'+st.node).classList.add('active');
  $('#stepnum').textContent=`Bước ${anim.i+1}/${anim.steps.length} · ${st.node}`; $('#caption').innerHTML=st.cap; applyPreview(st.ui);
  anim.i++; anim.busy=false; return true;
}
async function play(){ if(anim.playing) return; if(anim.i>=anim.steps.length) resetFlow(); anim.playing=true;
  while(anim.playing){ const ok=await runStep(); if(!ok) break; await sleep(1500/spd()); } }
$('#btnPlay').onclick=()=>{ if(!anim.steps.length||anim.i===0) resetFlow(); play(); };
$('#btnPause').onclick=()=>{ anim.playing=false; };
$('#btnStep').onclick=async()=>{ anim.playing=false; if(anim.busy) return; if(!anim.steps.length) resetFlow(); await runStep(); };
$('#btnReset').onclick=resetFlow;
$('#scenario').onchange=resetFlow;
resetFlow();

/* =====================================================================
   4. TAB ② — MOCKUP TƯƠNG TÁC
   ===================================================================== */
let S_ = null;
function newSession(){
  S_ = {...TBM.newState(), dismissed:0, corrections:0, log:[], review:new Set(), ended:false, started:null, timerId:null, lastAction:null, turn:0};
  $('#mk-chat').innerHTML=''; $('#mk-log').innerHTML=''; $('#mk-review').innerHTML='<li style="color:var(--muted)">Chưa có — Bi sẽ trỏ đoạn khi phát hiện chỗ hổng.</li>';
  $('#mk-summary').innerHTML='<span style="color:var(--muted)">Phiên đang diễn ra. Bấm "Kết thúc phiên" để xem tóm tắt (không có điểm số).</span>';
  $('#mk-confirm').innerHTML=''; $('#mk-input').value=''; $('#mk-input').disabled=false; $('#btnSend').disabled=false;
  clearInterval(S_.timerId); $('#timer').textContent='⏱ 90s gợi ý'; $('#timer').className='timer';
  renderCoverage(); renderProbes();
  const p=$('#persona').value;
  addBi({text: p==='mid' ? 'Chào bạn, mình là Bi. Mình đọc slide "vì sao LLM bịa" rồi nhưng thấy nó hơi rời rạc — bạn dạy lại giúp mình nối các ý với nhau nhé? Mình sẽ hỏi lại ở chỗ mình chưa thông. Đây là luyện tập, không có điểm; nếu mình hiểu nhầm bạn cứ sửa.' : 'Chào bạn! Mình là Bi, mới học tới đoạn "vì sao LLM bịa" mà chưa hiểu lắm. Bạn dạy lại cho mình nhé? Mình có thể hiểu nhầm nên bạn cứ sửa mình thoải mái — đây là luyện tập, không có điểm đâu.', badge:null});
  logAdd('session_start', `persona=${p} · mode=${isLive()?'LIVE '+cfg().provider+'/'+cfg().model:'MOCK'}`);
}
function renderSources(){ $('#mk-sources').innerHTML = SOURCES.map(s=>`<div class="src" id="src-${s.code}"><code>[${s.code}]</code> ${s.text}</div>`).join(''); }
function renderCoverage(){
  const lbl={miss:'chưa nhắc',partial:'một phần',hit:'đã nêu'};
  $('#mk-coverage').innerHTML = IDEAS.map(k=>{const st=S_.confirmed[k.id]?'hit':S_.coverage[k.id]; return `<div class="covrow"><span class="chip ${st}">${k.id} · ${lbl[st]}</span><span>${k.short} <code>${k.src}</code></span></div>`;}).join('');
  const hits=IDEAS.filter(k=>S_.confirmed[k.id]||S_.coverage[k.id]==='hit').length;
  $('#crit-cov').classList.toggle('ok',hits>=3); $('#crit-cov i').textContent=hits>=3?'✓':hits;
  $('#crit-ex').classList.toggle('ok',S_.examples>=1); $('#crit-ex i').textContent=S_.examples>=1?'✓':'';
  $('#crit-ans').classList.toggle('ok',S_.answered>=1); $('#crit-ans i').textContent=S_.answered>=1?'✓':'';
}
function renderProbes(){ $('#mk-probes').textContent=`Hỏi ngược ${S_.probes}/${S_.probeLimit}`; }
function logAdd(type, note, extra){ const e={t:new Date().toISOString().slice(11,19), turn:S_.turn, type, note, ...(extra||{})}; S_.log.push(e);
  const d=document.createElement('div'); d.className='li'; d.innerHTML=`<small>${e.t} · lượt ${e.turn}</small> <b>${type}</b> — ${note}`; $('#mk-log').appendChild(d); $('#mk-log').scrollTop=1e6; }
function addReview(codes){ (codes||[]).forEach(c=>S_.review.add(c)); if(!S_.review.size) return;
  $('#mk-review').innerHTML=[...S_.review].map(c=>`<li><code>[${c}]</code> <button class="btn sm ghost" onclick="flashSrc('${c}')">xem đoạn</button></li>`).join(''); }
function flashSrc(code){ const el=$('#src-'+code); if(!el) return; el.scrollIntoView({behavior:'smooth',block:'center'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),1800); }
function addHv(text){ const d=document.createElement('div'); d.className='msg hv'; d.innerHTML=`<div class="av">HV</div><div class="bub">${esc(text)}</div>`; $('#mk-chat').appendChild(d); scrollChat(); }
function addSys(text){ const d=document.createElement('div'); d.className='msg sys'; d.innerHTML=`<div class="bub">${text}</div>`; $('#mk-chat').appendChild(d); scrollChat(); }
function scrollChat(){ const c=$('#mk-chat'); c.scrollTop=c.scrollHeight; }
const esc = s => String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const linkCodes = s => esc(s).replace(/\[(T\d{2}-\d{3})\]/g,(m,c)=>`<a href="#" onclick="flashSrc('${c}');return false"><code>[${c}]</code></a>`);
function typingOn(){ const d=document.createElement('div'); d.className='msg bi'; d.id='typing'; d.innerHTML='<div class="av">Bi</div><div class="bub"><span class="typing"><i></i><i></i><i></i></span></div>'; $('#mk-chat').appendChild(d); scrollChat(); }
function typingOff(){ $('#typing')?.remove(); }

function addBi(r){
  const d=document.createElement('div'); d.className='msg bi';
  const confLbl={high:'Tin cậy cao',medium:'Tin cậy vừa',low:'Bi chưa chắc',none:'Không có căn cứ'};
  let meta=''; if(r.confidence) meta+=`<span class="badge ${r.confidence==='none'?'fail':r.confidence} ${r.confidence==='low'?'badge-lowconf':''}">${confLbl[r.confidence]}</span>`;
  if(r.action==='probe') meta+=`<span class="badge">Hỏi ngược ${S_.probes}/${S_.probeLimit}</span>`;
  if(r.action==='clarify') meta+=`<span class="badge low">không tính lượt</span>`;
  if(r.action==='understood') meta+=`<span class="badge high">Đã dạy được ✓</span>`;
  if(r.action==='not_yet') meta+=`<span class="badge low">Chưa dạy được · luyện tiếp</span>`;
  if(['paste_detected','refuse_answer'].includes(r.action)) meta+=`<span class="badge p3">Ngoài phạm vi ③</span>`;
  if(r.source==='llm') meta+=`<span class="badge acc">LLM · ${esc(r.model||'')}</span>`;
  if(r.guard) meta+=`<span class="badge fail" title="${esc(r.guard)}">guard-rail can thiệp</span>`;
  let body=`<div>${linkCodes(r.text||r.message||'')}</div>`;
  if(r.action==='understood') body+=`<div class="summary-edit" id="sum-${S_.turn}" contenteditable="false">${r.summary.map((s,i)=>`${i+1}. ${esc(s)}`).join('<br>')}</div><div>Đúng chưa?</div>`;
  let acts=[]; const id='m'+S_.turn+'_'+Math.random().toString(36).slice(2,6); d.id=id;
  if(r.why) acts.push(`<button class="btn sm btn-why" onclick="toggleWhy('${id}')">Vì sao Bi hỏi?</button>`);
  if(r.action==='probe') acts.push(`<button class="btn sm btn-dismiss" onclick="dismissProbe('${id}')">Bỏ qua câu này</button>`);
  if(r.action==='clarify') acts.push(`<button class="btn sm primary btn-confirm" onclick="confirmIdea('${id}','${r.target_idea}')">Đúng ý đó rồi</button>`);
  if(r.action==='understood') acts.push(`<button class="btn sm" onclick="endSession()">Đúng rồi · kết thúc</button><button class="btn sm btn-fix" onclick="editSummary('${id}','sum-${S_.turn}')">Bi hiểu sai ý mình → sửa</button>`);
  if(r.action==='not_yet') acts.push(`<button class="btn sm" onclick="extraProbe()">Dạy tiếp (+1 lượt)</button><button class="btn sm" onclick="askTA()">Gửi câu hỏi cho TA</button>`);
  if(r.action==='no_grounding') acts.push(`<button class="btn sm" onclick="askTA()">Gửi câu hỏi cho TA</button>`);
  (r.review||[]).forEach(c=>acts.push(`<button class="btn sm ghost" onclick="flashSrc('${c}')">Xem lại [${c}]</button>`));
  const why = r.why?`<div class="why hidden"><b>Vì sao Bi hỏi?</b> ${linkCodes(r.why)}${r.guard?`<br><b>Guard-rail:</b> ${esc(r.guard)}`:''}${r.raw?`<br><b>LLM why:</b> ${esc(r.raw)}`:''}</div>`:'';
  d.innerHTML=`<div class="av">Bi</div><div class="bub">${meta?`<div class="meta">${meta}</div>`:''}${body}${acts.length?`<div class="acts">${acts.join('')}</div>`:''}${why}</div>`;
  $('#mk-chat').appendChild(d); scrollChat(); return d;
}
function toggleWhy(id){ $('#'+id+' .why')?.classList.toggle('hidden'); }
function dismissProbe(id){ const el=$('#'+id); el.querySelector('.btn-dismiss').disabled=true; S_.probes=Math.max(0,S_.probes-1); S_.pendingProbe=false; S_.dismissed++; renderProbes();
  logAdd('dismissed','học viên bỏ qua câu hỏi ngược (G8) · hoàn lại lượt'); addBi({text:'Ok, bỏ qua câu đó. Bạn nói tiếp phần khác nhé, mình nghe.'}); }
function confirmIdea(id, k){ const el=$('#'+id); el.querySelector('.btn-confirm').disabled=true; S_.confirmed[k]=true; renderCoverage();
  logAdd('confirm', `học viên xác nhận ${k} đúng ý (G9 sau G10)`); addBi({text:`À, vậy là mình hiểu đúng ý ${k} rồi. Bạn nói tiếp đi!`}); }
function editSummary(id, sumId){ const s=$('#'+sumId); s.contentEditable='true'; s.focus(); const el=$('#'+id); el.querySelector('.btn-fix').disabled=true;
  const a=el.querySelector('.acts'); const b=document.createElement('button'); b.className='btn sm primary'; b.textContent='Lưu bản sửa'; b.onclick=async()=>{ s.contentEditable='false'; b.disabled=true; S_.corrections++;
    const txt=s.innerText; logAdd('correction', 'học viên sửa tóm tắt của Bi (G9)', {text:txt}); addSys('Bạn đã sửa tóm tắt của Bi — Bi đối chiếu lại với nguồn…'); await sendText('(sửa tóm tắt) '+txt, {isCorrection:true}); }; a.appendChild(b); }
function extraProbe(){ S_.probeLimit++; renderProbes(); logAdd('extra_probe','học viên chọn dạy tiếp (+1 lượt)'); addBi({text:'Được, mình hỏi thêm một câu nữa nhé. Bạn nói tiếp đi.'}); }
function askTA(){ const box=$('#mk-confirm'); box.innerHTML=`<div class="confirmbox" id="ta-confirm"><b>Sẽ gửi cho TA:</b> lời giải thích của bạn (${S_.history.filter(h=>h.role==='user').length} tin) + log đối chiếu của Bi. <b>Không</b> gửi điểm số (không có điểm). <div style="margin-top:6px;display:flex;gap:6px"><button class="btn sm primary" id="ta-yes">Gửi</button><button class="btn sm" id="ta-no">Huỷ</button></div></div>`;
  $('#ta-yes').onclick=()=>{ box.innerHTML=''; logAdd('escalate_ta','câu hỏi chuyển TA (giả lập)'); addSys('Đã gửi cho TA (giả lập). Bạn có thể tiếp tục dạy Bi.'); }; $('#ta-no').onclick=()=>box.innerHTML=''; box.scrollIntoView({behavior:'smooth'}); }

function startTimer(){ if(S_.started) return; S_.started=Date.now(); S_.timerId=setInterval(()=>{ const left=90-Math.floor((Date.now()-S_.started)/1000); const t=$('#timer');
  if(left>0){ t.textContent='⏱ '+left+'s'; t.classList.toggle('warn',left<=15); } else { t.textContent='⏱ hết 90s — không sao, cứ gửi tiếp'; t.className='timer'; clearInterval(S_.timerId); } },500); }
$('#mk-input').addEventListener('input',startTimer);
$('#mk-input').addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); $('#btnSend').click(); } });
$('#sampleSel').onchange=e=>{ if(e.target.value){ $('#mk-input').value=SAMPLES[e.target.value]; startTimer(); } e.target.value=''; };
$('#btnSend').onclick=()=>{ const t=$('#mk-input').value.trim(); if(!t||S_.ended) return; $('#mk-input').value=''; sendText(t); };
$('#btnNewSession').onclick=newSession; $('#persona').onchange=newSession;
$('#btnEnd').onclick=()=>{ if(S_.ended) return; const box=$('#mk-confirm'); box.innerHTML=`<div class="confirmbox"><b>Kết thúc phiên?</b> Log phiên (lời giải thích + đối chiếu + các lần sửa/bỏ qua) sẽ lưu cho giảng viên xem. <b>Không có điểm số.</b><div style="margin-top:6px;display:flex;gap:6px"><button class="btn sm primary" id="end-yes">Kết thúc</button><button class="btn sm" id="end-no">Huỷ</button></div></div>`; $('#end-yes').onclick=()=>{box.innerHTML='';endSession();}; $('#end-no').onclick=()=>box.innerHTML=''; };
$('#btnTA').onclick=askTA;
$('#btnCopyLog').onclick=()=>{ const j=JSON.stringify({session:new Date().toISOString(),persona:$('#persona').value,mode:isLive()?'live':'mock',coverage:S_.coverage,confirmed:S_.confirmed,examples:S_.examples,probes:S_.probes,answered:S_.answered,dismissed:S_.dismissed,corrections:S_.corrections,review:[...S_.review],history:S_.history,log:S_.log},null,2); navigator.clipboard?.writeText(j); $('#btnCopyLog').textContent='Đã sao chép ✓'; setTimeout(()=>$('#btnCopyLog').textContent='Sao chép JSON',1500); };

async function sendText(text, opt={}){
  if(S_.ended) return; S_.turn++; addHv(text); S_.history.push({role:'user',content:text}); $('#btnSend').disabled=true; typingOn();
  const persona=$('#persona').value; let r, err=null;
  if(isLive()){ try{ r = await decideLLM(text, S_, persona, cfg()); } catch(e){ err=e; } }
  if(!r){ await sleep(500+Math.random()*500); r = decide(text, S_, persona); r.source='mock'; if(err){ r.guard='LLM lỗi ('+String(err.message||err).slice(0,80)+') → fallback engine mock'; } }
  typingOff();
  // --- cập nhật state từ kết quả (guard-rail luôn chạy trong code, không phụ thuộc LLM) ---
  TBM.applyResult(S_, r);
  if(r.misconception) logAdd('misconception', r.misconception);
  S_.lastAction=r.action; renderCoverage(); renderProbes(); addReview(r.review);
  logAdd(r.action, `conf=${r.confidence} · cov=${IDEAS.map(k=>k.id[1]+':'+(S_.confirmed[k.id]?'hit':S_.coverage[k.id])[0]).join(' ')} · ex=${S_.examples} · probes=${S_.probes}/${S_.probeLimit}${r.source==='llm'?' · llm':''}${r.guard?' · GUARD':''}`);
  S_.history.push({role:'assistant',content:r.message + (r.summary?'\n'+r.summary.join('\n'):'')});
  addBi(r); $('#btnSend').disabled=false; $('#mk-input').focus();
  return r;
}
function endSession(){ if(S_.ended) return; S_.ended=true; clearInterval(S_.timerId); $('#mk-input').disabled=true; $('#btnSend').disabled=true;
  const hits=IDEAS.filter(k=>S_.confirmed[k.id]||S_.coverage[k.id]==='hit'); const ok=hits.length>=3&&S_.examples>=1&&S_.answered>=1; const missing=IDEAS.filter(k=>!hits.includes(k));
  $('#mk-summary').innerHTML=`<div class="verdict" style="color:${ok?'var(--green)':'var(--amber)'}">${ok?'✓ Đã dạy được Bi':'◐ Chưa dạy được — luyện tiếp'}</div>
    <div>Ý đã nêu: <b>${hits.length}/4</b> (${hits.map(k=>k.id).join(', ')||'—'}) · Ví dụ: <b>${S_.examples}</b> · Trả lời hỏi ngược: <b>${S_.answered}</b></div>
    <div>Hỏi ngược đã dùng: ${S_.probes}/${S_.probeLimit} · Bỏ qua: ${S_.dismissed} · Sửa: ${S_.corrections}</div>
    ${missing.length?`<div style="margin-top:6px">Nên xem lại: ${missing.map(k=>`<code>[${k.src}]</code>`).join(' ')}</div>`:''}
    <div style="margin-top:6px;color:var(--muted)">Đây là luyện tập — không có điểm. Log đã lưu cho giảng viên.</div>`;
  addReview(missing.map(k=>k.src)); logAdd('session_end', `verdict=${ok?'understood':'not_yet'}`); addSys('Phiên đã kết thúc. Bấm "Phiên mới" để dạy lại từ đầu.'); }
renderSources();

/* =====================================================================
   5. TAB ③ — LLM PROVIDERS (UI cấu hình)
   ===================================================================== */
function cfg(){ try{ return JSON.parse(localStorage.getItem('tbm_llm_cfg')||'null')||{provider:'openai',base:PROVIDERS.openai.base,model:PROVIDERS.openai.model,key:'',temp:0.3,live:false}; }catch{ return {provider:'openai',base:PROVIDERS.openai.base,model:PROVIDERS.openai.model,key:'',temp:0.3,live:false}; } }
function isLive(){ const c=cfg(); return !!(c.live && (c.key || c.provider==='custom')); }
function saveCfg(c){ localStorage.setItem('tbm_llm_cfg', JSON.stringify(c)); renderMode(); }
function renderMode(){ const b=$('#modeBadge'); if(isLive()){ b.textContent='LIVE · '+cfg().provider+' / '+cfg().model; b.classList.add('live'); } else { b.textContent='MOCK · engine rule-based'; b.classList.remove('live'); } }
function renderProviders(){ const c=cfg(); $('#providers').innerHTML=Object.entries(PROVIDERS).map(([id,p])=>`<div class="prov ${c.provider===id?'on':''}" data-p="${id}"><b>${p.name}</b><small>${p.base}</small></div>`).join('');
  $$('#providers .prov').forEach(el=>el.onclick=()=>{ const p=PROVIDERS[el.dataset.p]; $('#cfgBase').value=p.base; $('#cfgModel').value=p.model; $('#cfgKey').placeholder=p.hint; $('#cfgBaseHint').textContent=p.note.replace('{base}',p.base); $$('#providers .prov').forEach(x=>x.classList.toggle('on',x===el)); });
  $('#cfgBase').value=c.base; $('#cfgModel').value=c.model; $('#cfgKey').value=c.key||''; $('#cfgTemp').value=c.temp??0.3; $('#cfgBaseHint').textContent=PROVIDERS[c.provider].note.replace('{base}',c.base); $('#cfgKey').placeholder=PROVIDERS[c.provider].hint; $('#cfgKeyHint').textContent='Chỉ lưu trong localStorage của trình duyệt này. Đừng commit key. Với Anthropic, key phải là loại cho phép gọi từ browser.'; }
function readCfgForm(){ const provider=$('#providers .prov.on')?.dataset.p||'openai'; return {provider, base:$('#cfgBase').value.trim().replace(/\/$/,''), model:$('#cfgModel').value.trim(), key:$('#cfgKey').value.trim(), temp:parseFloat($('#cfgTemp').value)||0.3}; }
$('#btnSaveCfg').onclick=()=>{ const c=readCfgForm(); if(!c.key && c.provider!=='custom'){ $('#cfgOut').textContent='Thiếu API key.'; return; } saveCfg({...c,live:true}); $('#cfgOut').textContent='Đã lưu. Chế độ LIVE bật — tab ② sẽ gọi '+c.provider+' / '+c.model+'.'; };
$('#btnClearCfg').onclick=()=>{ localStorage.removeItem('tbm_llm_cfg'); renderProviders(); renderMode(); $('#cfgOut').textContent='Đã xoá key. Về chế độ MOCK.'; };
$('#btnTestCfg').onclick=async()=>{ const c=readCfgForm(); $('#cfgOut').textContent='Đang gọi '+c.provider+'…'; try{ const t0=Date.now(); const txt=await callLLM([{role:'system',content:'Bạn là trợ lý kiểm tra kết nối.'},{role:'user',content:'Trả lời đúng 3 từ: "Kết nối OK".'}], c); $('#cfgOut').textContent='OK ('+(Date.now()-t0)+' ms)\n'+txt; }catch(e){ $('#cfgOut').textContent='LỖI: '+(e.message||e)+'\n\nGợi ý: kiểm tra base URL, model id, key; với Ollama cần OLLAMA_ORIGINS=* để cho phép CORS.'; } };
renderProviders(); renderMode(); $('#promptPreview').textContent=systemPrompt('newbie',null);

/* =====================================================================
   6. TAB ④ — SPEC: tái hiện nguyên tắc & user stories
   ===================================================================== */
function flashEl(sel){ const el=typeof sel==='string'?$(sel):sel; if(!el) return; el.scrollIntoView({behavior:'smooth',block:'center'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),3400); }
async function demoPrinciple(code){
  showTab('mock'); newSession(); await sleep(300);
  const lastBi = () => [...$$('#mk-chat .msg.bi')].pop();
  if(code==='G10'){ await sendText(SAMPLES.lowconf); flashEl(lastBi().querySelector('.badge-lowconf')||lastBi()); flashEl('#mk-rules'); }
  if(code==='G11'){ await sendText(SAMPLES.happy); const b=lastBi(); b.querySelector('.why')?.classList.remove('hidden'); flashEl(b.querySelector('.why')); }
  if(code==='G8'){ await sendText(SAMPLES.happy); flashEl(lastBi().querySelector('.btn-dismiss')); }
  if(code==='G9'){ await sendText(SAMPLES.happy); await sleep(400); await sendText(SAMPLES.happy2); flashEl(lastBi().querySelector('.btn-fix')||lastBi()); }
  if(code==='G2'){ flashEl('#mk-notice'); await sendText(SAMPLES.noground); flashEl(lastBi().querySelector('.badge')); flashEl('#modeBadge'); }
  if(code==='G16'){ await sendText(SAMPLES.noground); askTA(); flashEl('#ta-confirm'); }
}
$$('[data-demo]').forEach(b=>b.onclick=()=>demoPrinciple(b.dataset.demo));
$$('[data-flow]').forEach(b=>b.onclick=()=>{ showTab('flow'); $('#scenario').value=b.dataset.flow; resetFlow(); play(); });

const US = [
  {id:'US-01', t:'Dạy lại cho agent bằng lời mình', as:'học viên AI20K vừa học xong đoạn "vì sao LLM bịa" trên VLearn', want:'gõ lời giải thích bằng cách nói của tôi cho agent-học-trò Bi trong khoảng 90 giây', so:'tôi tự phát hiện mình có thật sự hiểu hay chỉ tưởng là hiểu, trước khi đem vào lab',
   ac:[['AC1 Happy','Given phiên mới, Bi đã chào và nêu mục đích luyện tập','When tôi gửi lời giải thích có ≥3/4 ý chính và 1 ví dụ','Then hệ thống hiển thị coverage K1–K4 cập nhật và Bi hỏi ngược đúng ý còn hổng (không nêu nội dung ý đó)'],['AC2 Dán tài liệu','Given tôi dán nguyên đoạn transcript (trùng ≥45% 3-gram hoặc có mã đoạn)','When tôi gửi','Then Bi không đối chiếu, yêu cầu nói bằng lời mình, không tính lượt hỏi ngược'],['AC3 Đòi đáp án','Given tôi nhắn "cho mình đáp án"','When tôi gửi','Then Bi từ chối lộ đáp án và chỉ trỏ mã đoạn để xem lại']]},
  {id:'US-02', t:'Được hỏi ngược đúng chỗ hổng, tối đa 2 câu', as:'học viên đang dạy lại cho Bi', want:'nhận tối đa 2 câu hỏi ngược trỏ đúng ý tôi nói thiếu/sai so với transcript', so:'tôi biết chính xác chỗ mình chưa chắc mà không bị hỏi lan man',
   ac:[['AC1','Given lời giải thích thiếu K3','When Bi phản hồi','Then câu hỏi ngược nhắm vào K3 và mục "Vì sao Bi hỏi?" nêu mã [T06-138]'],['AC2 Sai tự tin','Given tôi nói "LLM tra Google" một cách chắc chắn','When Bi phản hồi','Then Bi hỏi bằng phản ví dụ, không dùng từ "sai", log ghi misconception'],['AC3 Hết lượt','Given đã hỏi ngược 2 câu và vẫn còn ý thiếu','When tôi gửi tiếp','Then Bi nói "chưa hiểu" + nêu tên ý thiếu + đoạn xem lại, không hỏi thêm trừ khi tôi bấm "Dạy tiếp"']]},
  {id:'US-03', t:'Bi thu hẹp khi không chắc (G10)', as:'học viên diễn đạt đúng nhưng khác từ ngữ tài liệu', want:'Bi hỏi làm rõ thay vì phán tôi sai', so:'tôi không bị "chấm sai" oan chỉ vì không dùng đúng từ trong slide',
   ac:[['AC1','Given lời giải thích chỉ khớp từ đồng nghĩa yếu ("máy đoán chữ")','When Bi phản hồi','Then nhãn "Bi chưa chắc", câu hỏi làm rõ đúng 1 ý, có nút "Đúng ý đó rồi", lượt hỏi ngược không đổi'],['AC2','Given tôi bấm "Đúng ý đó rồi"','When Bi tiếp tục','Then ý đó chuyển thành "đã nêu" và log ghi confirm'],['AC3 Không căn cứ','Given nội dung không khớp ý nào và không khớp mẫu nhầm lẫn','When Bi phản hồi','Then Bi nói không tìm thấy căn cứ, không phán đúng/sai, hiện nút gửi TA']]},
  {id:'US-04', t:'Sửa hoặc gạt bỏ phản hồi của Bi (G8/G9)', as:'học viên', want:'sửa trực tiếp bản tóm tắt Bi hiểu, hoặc bỏ qua một câu hỏi ngược', so:'tôi kiểm soát phiên luyện, không bị AI áp đặt',
   ac:[['AC1 Sửa','Given Bi đã "hiểu rồi" với tóm tắt','When tôi bấm "Bi hiểu sai ý mình" và lưu bản sửa','Then bản sửa được đối chiếu lại với nguồn, Bi ghi nhận, log ghi correction'],['AC2 Bỏ qua','Given Bi vừa hỏi ngược','When tôi bấm "Bỏ qua câu này"','Then lượt hỏi ngược được hoàn lại và Bi không hỏi lại câu đó'],['AC3 Kết thúc','Given tôi bấm "Kết thúc phiên"','When hộp xác nhận hiện','Then nêu rõ log gửi giảng viên, không có điểm số; huỷ được']]},
  {id:'US-05', t:'Giảng viên xem log phiên dạy', as:'giảng viên/TA AI20K', want:'xem log từng phiên: ý đã nêu, nhầm lẫn, số lần sửa/bỏ qua, đoạn gợi ý xem lại', so:'tôi biết lớp hổng ở ý nào để giảng lại đúng chỗ',
   ac:[['AC1','Given phiên đã kết thúc','When tôi mở log','Then thấy coverage K1–K4, misconception, corrections, dismissed, review codes, verdict'],['AC2','Given tôi bấm "Sao chép JSON"','When clipboard nhận','Then JSON chứa history + log, không chứa điểm số'],['AC3 Chuyển TA','Given học viên bấm "Gửi câu hỏi cho TA" và xác nhận','When gửi','Then log ghi escalate_ta kèm lời giải thích gốc']]},
];
$('#usList').innerHTML = US.map(u=>`<details class="us"><summary>${u.id} · ${u.t}</summary>
  <p><b>As a</b> ${u.as}<br><b>I want to</b> ${u.want}<br><b>So that</b> ${u.so}</p>
  ${u.ac.map(a=>`<div class="gwt"><b>${a[0]}</b>\n${a[1]}\n${a[2]}\n${a[3]}</div>`).join('')}</details>`).join('');

newSession();
