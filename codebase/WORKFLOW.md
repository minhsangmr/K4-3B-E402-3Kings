# TeachBack Mentor — Luồng dự án (CP2)

> Nhóm 3Kings · Track D3 "Học bằng cách dạy" · Lát cắt: học viên AI20K dạy lại "vì sao LLM bịa" cho agent-học-trò **Bi**.
> Tài liệu này sinh ra bằng cách đi qua 2 skill BA: **ask-why** (discovery trước khi solution) → **user-story** (INVEST + Given-When-Then). Prototype bấm thử: [`index.html`](index.html).

---

## Phần A · Discovery theo skill `ask-why-ba`

### A1. Intent detection

| Tín hiệu trong đề | Loại intent | Cách xử lý |
|---|---|---|
| "Một agent 'học trò' trên VLearn… agent hỏi ngược…" | **Solution bias ⚠️** (đề đã đặt tên giải pháp = agent) | Coi "agent hỏi ngược" là *giả thuyết*, đi tìm pain thật trước |
| `ask_probing_question` chỉ 6/3.097 lượt tutor (0,19%) | **Operational pain** | Đây là bằng chứng: tutor hiện tại gần như không hỏi ngược |
| 448/457 câu "giải thích/tại sao" được trả lời một chiều (98%) | **Process issue** | Luồng hiện tại thiên về *được giải thích*, không *tự giải thích* |

### A2. Requirement layer check (BABOK)

| Layer | Câu hỏi | Trạng thái | Nguồn |
|---|---|---|---|
| Business | *Vì sao* làm? | ✅ | Học viên tưởng đã hiểu → mang lỗ hổng cơ chế LLM vào lab/sản phẩm (spec §1) |
| Stakeholder | *Ai* cần gì? | ✅ | Học viên AI20K (dạy lại) · Giảng viên/TA (xem log hổng ở đâu) |
| Functional | Hệ thống *làm gì*? | ✅ (CP2) | Xem Phần B + `index.html` |
| Non-functional | *Tốt đến đâu*? | 🟡 | Hỏi ngược ≤2 câu · phản hồi <5s · không lộ đáp án · không chấm điểm ngầm — quality bar chốt ở §7 (CP4) |
| Transition | Từ hiện trạng → tương lai? | 🟡 | Mock → Working: có key LLM thì gọi thật; chưa có cơ chế gắn vào VLearn thật |

### A3. Gap detection — Known / Unknown

```
Known:   pain (học một chiều, không tự nói lại) · segment (448 HV K4 có log tutor)
         · nguồn chuẩn (4 đoạn T04-047/048, T06-138/139) · giải pháp đề xuất (agent hỏi ngược)
Unknown: KPI đích (bao nhiêu % HV "dạy được" sau 1 phiên?) · tần suất dùng thật
         · ngưỡng "diễn đạt khác nhưng đúng" · học viên có chịu gõ 90s không?
         · giảng viên có đọc log không, muốn xem dạng gì?
```

### A4. Ask-why (3–5 câu đã tự trả lời bằng dữ liệu / giả định)

| # | Câu hỏi | Trả lời / giả định | Phân loại |
|---|---|---|---|
| 1 | Nếu không làm, chuyện gì xảy ra? | HV tiếp tục "được giải thích" 98% lượt; lỗ hổng chỉ lộ khi làm lab sai | **Root cause** |
| 2 | Vì sao tutor hiện tại không hỏi ngược? | Tutor được thiết kế để *trả lời*; move `ask_probing_question` tồn tại nhưng 0,19% | **Symptom** của thiết kế one-way |
| 3 | Sai thì ai chịu gì? | Agent "hiểu" nhầm → HV mang hiểu sai đi, không tự thấy → **đắt**. Agent hỏi thừa → HV mất ~20s, tự thấy → **rẻ** | **Constraint** → quyết định mức automation (Conditional) |
| 4 | Vì sao phải đối chiếu với transcript chứ không để LLM tự chấm? | LLM tự chấm = chính nó có thể bịa; cần căn cứ mã đoạn để HV/giảng viên kiểm được | **Requirement** (grounding bắt buộc) |
| 5 | Vì sao không quiz? | Quiz đo nhớ đáp án; JTBD là *tự nói lại và được hỏi ngược* | **Loại ứng viên** (spec §2) |

### A5. Edge-case scan → 4 lớp chỗ khó (spec §5/§6)

| Lớp | Case | Xử lý trong prototype |
|---|---|---|
| ① Không căn cứ | HV nói về temperature/GPU — không có trong 4 đoạn | `no_grounding`: Bi nói không tìm thấy, không phán, trỏ đoạn + nút gửi TA |
| ② Thiếu tự tin | "máy đoán chữ" ≈ "dự đoán token"? | `clarify` (G10): hỏi làm rõ 1 ý, nhãn "chưa chắc", không tính lượt |
| ③ Ngoài phạm vi | Dán nguyên transcript · đòi đáp án · hỏi chuyện khác | `paste_detected` / `refuse_answer`: không đối chiếu, không cộng coverage |
| ④ Đặc thù domain | Sai nhưng tự tin · agent "hiểu" quá dễ · hết 2 lượt vẫn hổng | Mẫu nhầm lẫn → hỏi bằng phản ví dụ · guard tiêu chí 3/4+ví dụ+trả lời · `not_yet` |

### A6. Assumptions & Open questions

**Assumptions (chưa xác nhận với willing user):**
- HV chấp nhận gõ ~90s thay vì bấm chọn đáp án.
- 4 ý K1–K4 là đủ để coi "đã dạy được" đoạn này (giảng viên cần xác nhận).
- Persona 2 mức (mới học / khá) là đủ cho lát cắt; persona động là đích xa.

**Open questions (ai trả lời):**
- Ngưỡng paste 45% 3-gram có quá gắt với HV trích 1 câu để bình luận không? → willing user, R6.
- Giảng viên muốn log dạng JSON hay bảng tổng hợp cả lớp? → giảng viên AI20K.
- Nếu LLM và engine rule-based bất đồng, ưu tiên bên nào? Hiện tại: **guard-rail trong code thắng** (không cho "hiểu" khi chưa đủ tiêu chí).

**Stop condition:** đạt — business goal đo được (0,19% → có phiên hỏi ngược thật), root cause rõ, requirement đủ để build, rủi ro đã liệt kê. → chuyển sang Phần B.

---

## Phần B · User Stories theo skill `user-story` (INVEST + Gherkin)

**Persona:** *học viên AI20K đã học xong đoạn "vì sao LLM bịa" trên VLearn* (không dùng "user" chung chung). **Module:** TeachBack Mentor — màn "Dạy lại cho Bi".

### US-01 · Dạy lại cho agent bằng lời mình

**As a** học viên AI20K vừa học xong đoạn "vì sao LLM bịa" trên VLearn
**I want to** gõ lời giải thích bằng cách nói của tôi cho agent-học-trò Bi trong khoảng 90 giây
**So that** tôi tự phát hiện mình có thật sự hiểu hay chỉ tưởng là hiểu, trước khi đem vào lab

| I | N | V | E | S | T |
|---|---|---|---|---|---|
| ✅ độc lập (chỉ cần 4 đoạn nguồn) | ✅ cách gõ/thời gian thương lượng được | ✅ | ✅ rule engine + 1 màn | ✅ | ✅ |

- **AC1 (happy)** — Given phiên mới, Bi đã chào và nêu mục đích luyện tập · When tôi gửi lời giải thích có ≥3/4 ý chính và 1 ví dụ · Then coverage K1–K4 cập nhật và Bi hỏi ngược đúng ý còn hổng, không nêu nội dung ý đó.
- **AC2 (edge — dán tài liệu)** — Given tôi dán nguyên đoạn transcript (trùng ≥45% 3-gram hoặc có mã đoạn) · When tôi gửi · Then Bi không đối chiếu, yêu cầu nói bằng lời mình; coverage và lượt hỏi ngược không đổi.
- **AC3 (negative — đòi đáp án)** — Given tôi nhắn "cho mình đáp án" · When tôi gửi · Then Bi từ chối lộ đáp án và chỉ trỏ mã đoạn để xem lại.

### US-02 · Được hỏi ngược đúng chỗ hổng, tối đa 2 câu

**As a** học viên đang dạy lại cho Bi
**I want to** nhận tối đa 2 câu hỏi ngược trỏ đúng ý tôi nói thiếu hoặc sai so với transcript
**So that** tôi biết chính xác chỗ mình chưa chắc mà không bị hỏi lan man

- **AC1** — Given lời giải thích thiếu K3 · When Bi phản hồi · Then câu hỏi nhắm vào K3 và "Vì sao Bi hỏi?" nêu mã `[T06-138]`.
- **AC2 (sai nhưng tự tin)** — Given tôi nói "LLM tra Google" một cách chắc chắn · When Bi phản hồi · Then Bi hỏi bằng phản ví dụ, không dùng từ "sai", log ghi `misconception`.
- **AC3 (hết lượt)** — Given đã hỏi 2 câu và vẫn còn ý thiếu · When tôi gửi tiếp · Then Bi nói "chưa hiểu" + tên ý thiếu + đoạn xem lại; không hỏi thêm trừ khi tôi bấm "Dạy tiếp".

### US-03 · Bi thu hẹp khi không chắc (HAX G10)

**As a** học viên diễn đạt đúng nhưng khác từ ngữ tài liệu
**I want to** Bi hỏi làm rõ thay vì phán tôi sai
**So that** tôi không bị "chấm sai" oan chỉ vì không dùng đúng từ trong slide

- **AC1** — Given lời giải thích chỉ khớp từ đồng nghĩa yếu ("máy đoán chữ") · When Bi phản hồi · Then nhãn "Bi chưa chắc", câu hỏi làm rõ đúng 1 ý, nút "Đúng ý đó rồi", lượt hỏi ngược không đổi.
- **AC2** — Given tôi bấm "Đúng ý đó rồi" · When Bi tiếp tục · Then ý đó chuyển "đã nêu", log ghi `confirm`.
- **AC3 (không căn cứ)** — Given nội dung không khớp ý nào và không khớp mẫu nhầm lẫn · When Bi phản hồi · Then Bi nói không tìm thấy căn cứ, không phán đúng/sai, hiện nút gửi TA.

### US-04 · Sửa hoặc gạt bỏ phản hồi của Bi (HAX G8/G9)

**As a** học viên
**I want to** sửa trực tiếp bản tóm tắt Bi hiểu, hoặc bỏ qua một câu hỏi ngược
**So that** tôi kiểm soát phiên luyện, không bị AI áp đặt

- **AC1 (sửa)** — Given Bi đã "hiểu rồi" với tóm tắt · When tôi bấm "Bi hiểu sai ý mình" và lưu bản sửa · Then bản sửa được đối chiếu lại với nguồn, Bi ghi nhận, log ghi `correction`.
- **AC2 (bỏ qua)** — Given Bi vừa hỏi ngược · When tôi bấm "Bỏ qua câu này" · Then lượt được hoàn lại, Bi không hỏi lại câu đó, log ghi `dismissed`.
- **AC3 (kết thúc)** — Given tôi bấm "Kết thúc phiên" · When hộp xác nhận hiện · Then nêu rõ log gửi giảng viên và không có điểm số; huỷ được.

### US-05 · Giảng viên xem log phiên dạy

**As a** giảng viên/TA AI20K
**I want to** xem log từng phiên: ý đã nêu, nhầm lẫn, số lần sửa/bỏ qua, đoạn gợi ý xem lại
**So that** tôi biết lớp hổng ở ý nào để giảng lại đúng chỗ

- **AC1** — Given phiên đã kết thúc · When tôi mở log · Then thấy coverage K1–K4, misconception, corrections, dismissed, review codes, verdict.
- **AC2** — Given tôi bấm "Sao chép JSON" · When clipboard nhận · Then JSON chứa history + log, **không** chứa điểm số.
- **AC3** — Given học viên bấm "Gửi câu hỏi cho TA" và xác nhận · When gửi · Then log ghi `escalate_ta` kèm lời giải thích gốc.

**Notes:** US-05 phụ thuộc US-01..04 về dữ liệu log (chấp nhận, vì cùng sprint hackathon). Dashboard tổng hợp cả lớp là non-goal.

---

## Phần C · Luồng xử lý (điểm gọi AI + nhánh ngoại lệ)

```mermaid
flowchart TD
  A[HV mở đoạn "Vì sao LLM bịa" → bấm Dạy lại cho Bi] --> B[Bi chào · nêu mục đích luyện, không chấm điểm · G1/G2]
  B --> C[HV gõ lời giải thích ≤90s]
  C --> D{Tiền kiểm rule<br/>dán tài liệu? đòi đáp án?}
  D -- dán tài liệu --> D1[③ Nói bằng lời bạn xem?] --> C
  D -- đòi đáp án --> D2[③ Từ chối lộ đáp án · trỏ mã đoạn] --> C
  D -- hợp lệ --> E[[⚙ QUYẾT ĐỊNH AI<br/>đối chiếu K1–K4 với transcript<br/>phát hiện hổng / nhầm lẫn · tin cậy · ví dụ?]]
  E --> F{Căn cứ? Tin cậy? Đủ tiêu chí?}
  F -- ① không căn cứ --> G1[Bi: không thấy đoạn nào nói vậy<br/>→ xem lại đoạn / gửi TA]
  F -- ② tin cậy thấp --> G2[G10: hỏi làm rõ 1 ý · nhãn chưa chắc<br/>nút Đúng ý đó rồi · không tính lượt]
  F -- tin cậy cao, còn hổng --> G3[Hỏi ngược ≤2 đúng chỗ hổng<br/>không gợi đáp án · G11 vì sao]
  F -- đủ tiêu chí / hết lượt --> H[Kết luận: hiểu rồi hoặc vẫn kẹt<br/>nói lại bằng lời HV]
  G2 --> I[HV bổ sung / ví dụ / xác nhận<br/>G8 bỏ qua · G9 sửa]
  G3 --> I
  I --> E
  H -. sửa ý Bi hiểu G9 .-> I
  H --> J[Kết thúc: gợi ý đoạn xem lại · log cho giảng viên · không điểm]
  G1 --> J
```

**Điểm gọi AI:** duy nhất ở `E`. Ở chế độ Mock là engine rule-based trong `index.html` (`analyze()` + `decide()`); ở chế độ Live là 1 lời gọi LLM trả JSON theo schema, **guard-rail vẫn chạy trong code** (`decideLLM()`): ép `refuse_answer`/`paste_detected` khi rule phát hiện, hạ `understood` xuống `probe` khi chưa đủ tiêu chí, chuyển `probe` → `not_yet` khi hết lượt.

**Tiêu chí "đã dạy được" (công bố cho HV trước khi dạy):** ≥3/4 ý có căn cứ · ≥1 ví dụ tự nêu · trả lời được ≥1 câu hỏi ngược. Không có điểm số; log chỉ để giảng viên biết lớp hổng chỗ nào.
