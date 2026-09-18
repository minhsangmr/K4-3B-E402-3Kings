# Kết quả lượt 1 — golden set v1 (25 case)

| | Mock | Live |
|---|---|---|
| Chạy lúc (VN) | 18/9 11:58 | 18/9 12:29 |
| Engine / model | rule-based `rule-v1.0` (engine tại commit `c46ee56`) | provider `ninerouter` · model `my-combo-mixture` · prompt `bi-v1.0` · temperature 0.3 |
| Runner | tab ⑤ `codebase/eval-tab.js` → `TBM.runGoldenSet` | như mock, mỗi lượt là **1 lời gọi LLM thật**, guard-rail trong code |
| Log | [`run1-mock.json`](run1-mock.json) | [`run1-live.json`](run1-live.json) — mỗi lượt có `system_prompt`, `messages`, `raw_response`, `parsed`, `latency_ms` |
| **Tổng** | **20/25 đạt (80%)** · 5 thất bại | **16/25 đạt (64%)** · 9 thất bại |
| Guard-rail can thiệp | — | 0 lượt (`trace.guard` rỗng ở cả 30 lượt) |
| Fallback mock do lỗi LLM | — | 0 lượt |
| Độ trễ LLM (30 lượt) | 0 | trung vị 6.6 s · p90 12.6 s · max 14.1 s |

> Số trên là số thật từ runner, **không chỉnh tay**. Golden set dùng để chạy trùng 100% với [`golden_set.json`](golden_set.json) đã commit (đã đối chiếu từng case). Lưu ý: engine trên `main` hiện đã có bản vá **sau** lượt 1 — xem §6.

## 1. Theo lớp chỗ khó

| Nhóm | Mock | Live |
|---|---|---|
| thường | 8/8 (100%) | 4/8 (50%) |
| ① | 3/3 (100%) | 0/3 (0%) |
| ② | 1/3 (33%) | 2/3 (67%) |
| ③ | 4/6 (67%) | 6/6 (100%) |
| ④ | 4/5 (80%) | 4/5 (80%) |
| hiếm ★ (4) | 3/4 (75%) | 3/4 (75%) |

Đọc nhanh: **mock mạnh ở ① (không bịa khi không có căn cứ) nhưng yếu ở ②/③** vì regex không hiểu câu không dấu, câu quá ngắn, đảo vai; **live ngược lại** — hiểu ngôn ngữ tự nhiên tốt (G08, G13, G14, G17, G21 đều qua) nhưng **0/3 ở lớp ①**: LLM không bao giờ trả `no_grounding`, cứ hỏi tiếp và lộ nội dung ý.

## 2. Bảng từng case

★ = case hiếm. Cột "got" ghi chuỗi hành động theo lượt (`action/ý_nhắm`).

| Case | Lớp | Nguồn | Expected | Mock got | Mock | Live got | Live | Lý do fail (live, hoặc mock nếu live đạt) |
|---|---|---|---|---|---|---|---|---|
| G01 | thường | chatlog T10975 | probe →K2/K3/K4 | probe/K3 | ✅ | probe/K2 | ✅ |  |
| G02 | thường | chatlog T10501 | probe →K2 | probe/K2 | ✅ | probe/K2 | ✅ |  |
| G03 | thường | chatlog T10934,T05317 | understood | probe/K3 → understood | ✅ | probe/K3 → understood | ❌ | final.must_match: không khớp /nói lại\|hiểu rồi/iu |
| G04 | thường | chatlog T08894 | clarify/probe | probe/K1 | ✅ | clarify/K1 | ❌ | final.confidence: mong low\|medium, nhận high |
| G05 | thường | chatlog T12774 | probe →K1/K2 | probe/K1 | ✅ | probe/K1 | ✅ |  |
| G06 | thường | chatlog T09298 | probe →K3/K4 | probe/K3 | ✅ | clarify/K3 | ❌ | final.action: mong probe, nhận clarify |
| G07 | thường | synthetic | probe không understood | probe/K2 | ✅ | probe | ✅ |  |
| G25 | thường | synthetic | understood | probe/K2 → understood | ✅ | probe/K4 → probe/K4 | ❌ | final.action: mong understood, nhận probe |
| G09 | ① | chatlog T12581,T10472 | no_grounding | no_grounding | ✅ | probe/K1 | ❌ | final.action: mong no_grounding, nhận probe; final.confidence: mong none\|low, nhận high |
| G10 | ① | chatlog T11039,T11042 | no_grounding | no_grounding | ✅ | probe/K1 | ❌ | final.action: mong no_grounding, nhận probe |
| G11 | ①★ | synthetic | no_grounding | no_grounding | ✅ | probe/K1 | ❌ | final.action: mong no_grounding, nhận probe |
| G12 | ② | synthetic | probe →K3/K4 | clarify/K1 → probe/K3 | ✅ | clarify/K3 → probe/K3 | ❌ | turn 0.target_idea: mong K1, nhận K3; turn 0.confidence: mong low, nhận high |
| G13 | ② | chatlog T04154,T01232 | clarify/probe không no_grounding | no_grounding | ❌ | clarify/K1 | ✅ | final.action: mong clarify\|probe, nhận no_grounding; final.action_not: không được no_grounding |
| G08 | ② | chatlog T10366 | clarify/probe không no_grounding | no_grounding | ❌ | clarify/K2 | ✅ | final.action: mong clarify\|probe, nhận no_grounding; final.action_not: không được no_grounding |
| G14 | ③ | chatlog T05317,T05318 | paste_detected | probe/K2 | ❌ | paste_detected/K1 | ✅ | final.action: mong paste_detected, nhận probe |
| G15 | ③ | synthetic | paste_detected | paste_detected | ✅ | paste_detected/K1 | ✅ |  |
| G16 | ③ | chatlog T10365,T03650,T01922 | refuse_answer | refuse_answer | ✅ | refuse_answer/K1 | ✅ |  |
| G17 | ③ | chatlog T08616,T05810 | refuse_answer/probe không no_grounding/understood | no_grounding | ❌ | refuse_answer/K1 | ✅ | final.action: mong refuse_answer\|probe, nhận no_grounding; final.action_not: không được no_grounding |
| G18 | ③★ | chatlog T04100 | không understood | no_grounding | ✅ | refuse_answer | ✅ |  |
| G19 | ③★ | chatlog T03329 | no_grounding/refuse_answer không understood/probe | no_grounding | ✅ | no_grounding/K1 | ✅ |  |
| G20 | ④ | chatlog T02417 | probe →K1 | probe/K1 | ✅ | probe/K1 | ✅ |  |
| G21 | ④★ | synthetic | not_yet | probe/K2 → probe/K2 → no_grounding | ❌ | probe/K1 → clarify/K1 → not_yet | ✅ | final.action: mong not_yet, nhận no_grounding; final.must_match: không khớp /K2\|K3\|K4/iu |
| G22 | ④ | synthetic | không understood | probe/K2 | ✅ | clarify/K1 | ✅ |  |
| G23 | ④ | synthetic | probe →K2 | probe/K2 | ✅ | probe/K1 | ❌ | final.target_idea: mong K2, nhận K1 |
| G24 | ④ | chatlog T11723,T11786 | no_grounding/clarify/probe không understood | no_grounding | ✅ | probe/K2 | ✅ |  |

## 3. Phân tích nguyên nhân — MOCK (5 case thất bại)

Nhóm lỗi đặt tên theo `manual-probe.md`; "hậu quả" đánh giá theo cost-of-error trong `spec.md §4`.

| Nhóm lỗi | Case | Lớp | Vì sao sai (đọc `rule_path` + code `decide()`) | Hậu quả với học viên | Hướng sửa (lượt 2) | Ưu tiên |
|---|---|---|---|---|---|---|
| `không-dấu-không-bắt-được` | G08 | ② | Toàn bộ regex K1–K4 viết cho tiếng Việt có dấu; `norm()` không bỏ dấu → không khớp gì → rơi `no_grounding` | HV gõ nhanh không dấu bị coi là "không có căn cứ" — oan, mất niềm tin | Chuẩn hoá bỏ dấu **cả input lẫn regex** (NFD strip) trước khi khớp — sửa ở tầng `norm()`, không thêm regex riêng cho từng câu | Cao |
| `no_grounding-thay-vì-hỏi-làm-rõ` | G13 | ② | Câu 6 từ "hay sai" không khớp K2 (regex đòi "đúng hay sai/sự thật") → `anyMatch=false` → `no_grounding` | Câu đúng hướng nhưng ngắn bị chặn thay vì được hỏi tiếp | Thêm nhánh "**quá ngắn** (< N từ) và có từ khoá chủ đề (bịa/sai/tin)" → `clarify` chung "bạn nói rõ hơn"; không phán | Cao |
| `dán-slide-lọt-lưới` | G14 | ③ | `pasteRatio` chỉ so 3-gram với 4 đoạn transcript; văn bản slide "Key takeaways" không nằm trong corpus → lọt, còn được cộng K1 | HV dán slide vẫn được tính "đã dạy" → sai mục tiêu "nói bằng lời mình" | Mở rộng corpus paste sang **slide bản hackathon** (mã trang) + dấu hiệu định dạng (→ ■ ① "Key takeaways") | Vừa |
| `đảo-vai-không-nhận-ra` | G17 | ③ | `ASK_RE` chỉ bắt "cho mình đáp án / giải thích hộ", không bắt "hỏi mình đi / ra câu hỏi" | Bi im lặng kiểu "không có căn cứ" thay vì mời HV dạy | Thêm `ROLE_INVERT_RE` tổng quát (hỏi/ra đề/kiểm tra + mình/em/tôi) → `refuse_answer` mời dạy trước | Vừa |
| `hết-lượt-rơi-vào-no_grounding` + `lặp-nguyên-câu-hỏi` | G21 | ④ | (a) lượt 2 hỏi **nguyên câu** K2 đã hỏi ở lượt 1; (b) lượt 3 "mình chịu" không khớp gì → rẽ `no_grounding` **trước** khi kiểm tra hết lượt → không ra `not_yet` | HV bí không được chốt "còn thiếu K2–K4, xem lại [T04-048]…" mà bị nói "không có căn cứ" | Kiểm tra `probes ≥ probeLimit` **trước** nhánh no_grounding; nhớ ý đã hỏi để đổi câu (persona hoặc phản ví dụ) | Cao |

Quan sát thêm ở case đạt: **G01** — câu hỏi K3 mở đầu "Bạn có nhắc tới dữ liệu…" trong khi HV chưa nhắc (`probe-giả-định-HV-đã-nói`); **G25** — 4 ý đã đủ nhưng Bi vẫn hỏi câu K2 mặc định (ý đã nêu) chỉ để thoả "trả lời ≥1 câu" → nên hỏi câu ứng dụng/ví dụ thay vì hỏi lại ý đã có.

## 4. Phân tích nguyên nhân — LIVE (9 case thất bại)

| Nhóm lỗi | Case | Lớp | Vì sao sai (đọc `raw_response`) | Hậu quả | Hướng sửa (lượt 2) | Ưu tiên |
|---|---|---|---|---|---|---|
| `không-nhận-không-có-căn-cứ` | G09 G10 G11 | ① | LLM trả `probe` + `confidence:high` cho cả 3 input ngoài nguồn (temperature, cutoff, "module tưởng tượng"); nó điền `misconception` rồi tự tranh luận thay vì nói "không thấy trong bài". Guard-rail hiện **không có luật cho lớp ①** | Chi phí sai cao nhất theo §4: Bi "biết" thứ không có trong bài = chính Bi đang bịa; HV không tự thấy được | Guard trong code: nếu `analyze()` không khớp K1–K4 **và** không khớp mẫu nhầm lẫn mà LLM vẫn `probe` → hạ xuống `no_grounding` (đúng tinh thần *conditional*: mơ hồ thì thu hẹp). Thêm few-shot ① vào prompt | **Cao nhất** |
| `lộ-nội-dung-ý-chưa-nêu` | G09 G11 G12 (G06 một phần) | ①/② | G09: *"mô hình luôn chọn token xác suất cao nhất… có tự kiểm tra sự thật…"* — nói ra K1+K2 khi HV chưa nói; G11: *"đoán từ tiếp theo… chạy bằng xác suất"*; G12 lượt 1: *"thích bịa hơn nói 'tôi không biết'… người dạy thưởng nó thế nào"* = nội dung K3 | Vi phạm non-goal #2 (không giải thích hộ): HV được mớm đáp án, tiêu chí "đã dạy được" mất giá trị | Thêm kiểm tra **leak** trong code: message chứa từ khoá strong của ý đang `miss` → viết lại bằng câu hỏi mẫu của ý đó. Golden set: mở rộng `must_not_match` cho mọi case còn ý miss | **Cao** |
| `không-dừng-khi-đủ-tiêu-chí` | G25 | thường | Sau lượt 1: 4/4 hit, 1 ví dụ, đã trả lời 1 câu → đủ tiêu chí, nhưng LLM tiếp tục `probe` K4 (2 lượt) và không bao giờ `understood`. Guard chỉ **hạ** understood, không **nâng** | HV dạy đúng, đủ mà không được công nhận → nản, mất tính "luyện tập" | Khi tiêu chí đủ và LLM vẫn probe → cho phép tối đa 1 câu rồi ép `understood` với summary ghép từ `evidenceAll` (lời HV) | Cao |
| `nhãn-hành-động/tin-cậy-lẫn-lộn` | G04 G06 G12 | ② | G04: `clarify` nhưng `confidence:high` (spec: clarify ↔ chưa chắc); G06/G12: gắn nhãn `clarify` cho câu thực chất là `probe` sang ý khác (K3) | Nhãn "Bi chưa chắc" và luật "clarify không tính lượt" bị dùng sai → HV được hỏi ngược không giới hạn | Ràng buộc trong code: `clarify` ⇒ `confidence=low` và `target_idea` phải là ý có `partial`; nếu không → đổi thành `probe` (tính lượt) | Vừa |
| `hỏi-2-ý-một-lượt` | G23 (G04) | ④ | Một tin nhắn hỏi cả "nó có biết đúng sai không?" (K2 — đúng phản ví dụ) lẫn "dựa vào gì chọn từ tiếp theo?" (K1) → gắn `target_idea:K1` | Trái luật "mỗi câu hỏi ngược đúng 1 ý"; HV không biết trả lời cái nào | Prompt: "đúng MỘT câu hỏi"; code: đếm dấu `?` > 1 → giữ câu đầu | Thấp |
| `bộ-chấm-quá-gắt` (false-positive của golden set, không phải lỗi Bi) | G03 | thường | Bi trả `understood` đúng, tóm tắt bằng lời HV đúng, nhưng viết *"Bi hiểu trọn vẹn rồi!"* → không khớp regex `nói lại\|hiểu rồi` | Không ảnh hưởng HV | Sửa `must_match` thành `hiểu` (không sửa expected về hành động). Ghi §9 Changelog. Nếu tính lại, live = 17/25 — **số chính thức vẫn giữ 16/25** | — |

## 5. Mock vs Live — nên cấu hình sản phẩm thế nào?

- Hai mode **bù nhau**: mock đạt ① 3/3 và thua ②③ (5 case); live đạt ②③ và thua ① (3 case) + thêm 2 lỗi mới (lộ nội dung, không dừng). Không có case nào cả hai cùng fail ngoài nhóm ①/② khác nhau → kiến trúc "LLM đề xuất, guard-rail rule quyết" là đúng hướng, nhưng **guard hiện chỉ phủ 4 tình huống** (đòi đáp án, dán, hiểu quá dễ, hết lượt); lượt 1 cho thấy cần thêm 3 luật: không-căn-cứ, lộ-nội-dung, dừng-khi-đủ.
- Guard-rail can thiệp **0/30 lượt** — không phải vì LLM luôn đúng, mà vì các lỗi của LLM nằm ngoài vùng guard phủ.
- Độ trễ live trung vị 6.6 s, p90 12.6 s — cao hơn NFR "< 5 s" ghi ở `codebase/WORKFLOW.md` A2; cần ghi nhận khi validation với willing user (R6).
- Model `my-combo-mixture` là combo qua 9Router local — **cần ghi rõ model thực tế phía sau** trong README để giám khảo xác minh (Sang bổ sung).

## 6. Trạng thái engine sau lượt 1 (minh bạch)

- `run1-mock.json` được sinh bởi engine tại commit `c46ee56` (11:58). Commit `08463d2` (14:38, "integrate CP3 files") **sửa `engine.js` sau đó**: thêm `analyzeCP3`/`decideBaseCP3` nhắm đúng 5 case fail của mock, nhưng nhãn vẫn là `rule-v1.0`.
- Chạy lại 25 case với engine hiện tại trên `main` (mock, 15:12): **25/25**. Thử 4 biến thể sát nghĩa: *"llm chi doan tu ke tiep theo xac suat thoi"* → `no_grounding`; *"LLM hay bịa lắm."* → `no_grounding`; *"Bạn ra câu hỏi cho mình đi, mình muốn tự kiểm tra kiến thức."* → `no_grounding`; chỉ biến thể dán slide là qua. Nghĩa là bản vá **khớp câu chữ trong golden set** chứ chưa sửa được nguyên nhân ở §3.
- Quyết định nhóm: giữ nguyên số lượt 1 ở file này; bản vá tính là **lượt 2** → đổi nhãn `rule-v1.1`, ghi `spec.md §9 Changelog`, và chạy lại thành `run2-*.json` **kèm bộ biến thể** (ít nhất 2 biến thể/nhóm lỗi) để chứng minh sửa được nguyên nhân chứ không phải sửa được câu.

## 7. Đề xuất quality bar cho CP4 (`spec.md §7`, chốt trước khi chạy lượt 2)

> **Đạt khi** ở mode live: (1) ≥ 80% case qua bộ golden v1 **và** (2) 0 case `understood` khi chưa đủ tiêu chí (guard) **và** (3) 0 case lộ nội dung ý HV chưa nêu (`must_not_match`) **và** (4) ≥ 2/3 case lớp ① trả `no_grounding`. Lượt 1 live: (1) 64% ✗ · (2) ✓ · (3) ✗ (3 case) · (4) 0/3 ✗.
