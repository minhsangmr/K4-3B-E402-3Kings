# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 17/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — [Tên lát cắt] · Nhóm [XX] · Zone [X]
Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở [x] D — Học tập thích ứng & tương tác
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ): **Học viên AI20K vừa học xong đoạn về "vì sao LLM bịa/hallucination" trên VLearn**, đang muốn chắc là mình hiểu trước khi đem kiến thức đó vào lab/prompt/debug sản phẩm AI.
- Core JTBD (không tên sản phẩm/AI trong câu): Sau khi học một khái niệm nền khó, học viên cần tự nói lại bằng lời của mình, được hỏi ngược đúng chỗ hổng, và biết đoạn nào cần xem lại để đủ tự tin áp dụng vào bài lab hoặc sản phẩm.
- Problem statement (KHÔNG chữ AI): Khi chỉ đọc slide hoặc hỏi tutor để được giải thích, học viên thường nhận một câu trả lời một chiều, không phải tự nói lại nên dễ tưởng là đã hiểu; hậu quả là khi làm lab hoặc build sản phẩm, bạn không nhận ra lỗ hổng về cơ chế LLM sinh token/hallucination cho đến lúc áp dụng sai.
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát: từ `eval/data/vlearn-pack/chatlog/tutor_turns.csv`, trong cohort K4 có `3.097` lượt tutor của `448` học viên, nhưng chỉ `6/3.097` lượt dùng `move_used = ask_probing_question` (`0,19%`) và chỉ `6/3.097` lượt có `understanding_level` (`0,19%`).
  - Trong `457` câu tự gõ K4 có từ khóa `giải thích/giai thich/explain/tại sao/vì sao/why`, `448/457` lượt (`98,03%`) được xử lý kiểu trả lời/giải thích trực tiếp (`review_concept`, `give_direct_answer`, `give_example`).
  - Ví dụ kiểm được: `T10317`, `T10321`, `T10354`, `T10355`, `T10408`, `T10413`.
  - Nguồn bài học cho lát cắt: transcript có đoạn nêu LLM dự đoán token và có thể hallucinate vì sinh chuỗi theo xác suất (`[T04-047]`, `[T04-048]`), cùng đoạn giải thích hallucination do bias dữ liệu, fine-tuning/RLHF và cần RAG/citation để giảm rủi ro (`[T06-138]`, `[T06-139]`).

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):
  | Ứng viên | Bao nhiêu người | Tần suất / dấu hiệu | Tốn gì mỗi lần | Khả thi |
  |---|---:|---|---|---|
  | TeachBack Mentor cho đoạn "vì sao LLM bịa/hallucination" | `448` học viên K4 có log tutor; lát cắt nhắm nhóm vừa học topic này | Tutor hiện gần như không hỏi ngược: `ask_probing_question` chỉ `6/3.097` lượt (`0,19%`) | Hiểu nhầm cơ chế LLM sinh token/hallucination, áp dụng sai khi làm lab/prompt/debug | Cao: dùng transcript/slide làm nguồn chuẩn, hỏi ngược tối đa 2 câu, validation với học viên AI20K |
  | Tutor giải thích trực tiếp tốt hơn | Nhóm có `457` câu tự gõ hỏi giải thích/tại sao/why | `448/457` lượt (`98,03%`) đã được xử lý bằng trả lời/giải thích trực tiếp | Vẫn là học một chiều; học viên dễ tưởng đã hiểu vì không phải tự diễn đạt | Trung bình: dễ cải thiện câu trả lời, nhưng không giải quyết pain chính của Canvas |
  | Quiz/checklist sau bài học | Có thể áp dụng rộng cho học viên vừa học xong bài | Chưa có số liệu riêng trong Canvas; chỉ suy ra từ nhu cầu kiểm tra hiểu biết | Có nguy cơ đo nhớ đáp án thay vì khả năng giải thích và sửa lỗ hổng | Trung bình: dễ build nhưng kém sát Track D3 "học bằng cách dạy" |
- Ứng viên ĐÃ LOẠI + vì sao: Loại hướng "tutor giải thích trực tiếp tốt hơn" vì dữ liệu Canvas cho thấy luồng hiện tại đã thiên mạnh về giải thích trực tiếp (`448/457`, `98,03%`), trong khi pain chính là học viên không phải tự nói lại. Loại quiz/checklist vì Canvas cần một trải nghiệm dạy lại cho agent-học-trò, không chỉ kiểm tra lựa chọn đúng/sai.
- Ứng viên CHỌN + vì sao (bằng số): **Track D3 — AI20K TeachBack Mentor.** Chọn lát cắt một học viên vừa học đoạn "vì sao LLM bịa" dạy lại cho agent-học-trò trong 90 giây; AI đối chiếu lời giải thích với transcript, hỏi ngược tối đa 2 câu vào chỗ thiếu/sai mà không lộ đáp án, rồi giúp học viên biết đoạn nào cần xem lại. Lý do chọn: trong `3.097` lượt tutor K4 chỉ `0,19%` có hỏi probing và `0,19%` có `understanding_level`, cho thấy khoảng trống rõ giữa "được giải thích" và "được kiểm tra hiểu thật".

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả): **Một học viên AI20K vừa học đoạn "vì sao LLM bịa"** · **dạy lại cho agent-học-trò Bi bằng lời mình trong ~90 giây** · **AI quyết định lời giải thích hổng/sai ở đâu so với 4 đoạn transcript (và có đủ căn cứ để hỏi hay không)** · **học viên nhận tối đa 2 câu hỏi ngược đúng chỗ hổng và biết đoạn nào cần xem lại.**
- Non-goals (≥3 thứ KHÔNG build):
  1. Không chấm điểm / không ghi điểm vào hồ sơ — chỉ log để giảng viên biết lớp hổng ở ý nào (an toàn: "luyện, không thi").
  2. Không để agent giải thích hộ hay sinh đáp án mẫu — Bi chỉ hỏi, nêu phản ví dụ, trỏ mã đoạn.
  3. Không cover nhiều chủ đề — chỉ 1 đoạn với 4 đoạn nguồn `[T04-047] [T04-048] [T06-138] [T06-139]` và 4 ý chính K1–K4.
  4. Không persona động nhiều mức — chỉ 2 mức (mới học / khá); không dashboard tổng hợp cả lớp; không voice; không gắn vào VLearn thật.
- Mức prototype nhắm tới: [ ] Sketch [x] Mock [x] Working (khi cấu hình API key) — phần nào mock, phần nào thật:
  - **Thật:** giao diện `codebase/index.html` (tab ② bấm thử được); engine đối chiếu rule-based chạy thật: tiền kiểm dán tài liệu (trùng ≥45% 3-gram hoặc có mã đoạn) và đòi đáp án, khớp 4 ý K1–K4 theo mẫu từ mạnh/yếu, phát hiện 3 mẫu nhầm lẫn phổ biến, mức tin cậy, giới hạn 2 lượt hỏi ngược, tiêu chí "đã dạy được", log phiên JSON. Khi có API key (tab ③: OpenAI / Anthropic / Gemini / OpenRouter / custom) mỗi lượt là **1 lời gọi LLM thật** với prompt persona Bi + 4 đoạn nguồn, trả JSON; guard-rail vẫn chạy trong code (ép từ chối lộ đáp án, chặn "hiểu" khi chưa đủ tiêu chí, chặn hỏi quá 2 câu).
  - **Giả lập:** 4 đoạn nguồn là trích lược/paraphrase kèm mã đoạn (không dán data pack); câu hỏi của Bi ở mode Mock là bộ câu soạn sẵn theo từng ý; "gửi TA" và "lưu log cho giảng viên" chỉ ghi vào log trong trang (không backend, không đăng nhập). Tab ① là hoạt ảnh scripted của 6 kịch bản, dùng chính engine và câu mẫu của tab ②.
- Automation: [ ] augment [x] conditional [ ] automate — lý do theo cost-of-error:
  - **AI tự làm (case chắc):** khi tìm được đoạn nguồn mâu thuẫn hoặc ý còn thiếu rõ ràng, Bi tự hỏi ngược. Nếu sai ở đây, lỗi là *hỏi thừa một câu*: học viên chịu ~20 giây, **tự thấy ngay** và bấm "Bỏ qua câu này" (lượt được hoàn lại) → **rẻ, người dùng tự sửa được** → cho AI tự làm.
  - **Chuyển người / thu hẹp (case mơ hồ):** khi lời giải thích chỉ khớp từ đồng nghĩa yếu (tin cậy thấp) hoặc không khớp đoạn nào (không căn cứ), Bi **không phán đúng/sai** — chỉ hỏi làm rõ 1 ý hoặc nói rõ "không tìm thấy trong bài" và cho gửi TA. Vì sai ở đây là *phán "đúng" cho lời giải thích sai* hoặc *phán "sai" cho diễn đạt đúng nhưng khác slide*: học viên mang hiểu nhầm vào lab, **không tự thấy được**, giảng viên phải gỡ sau cả buổi → **đắt** → không cho AI tự kết luận.
  - **Kết luận "đã dạy được" không tự chốt cứng:** tiêu chí công bố trước (≥3/4 ý có căn cứ · ≥1 ví dụ · trả lời ≥1 câu hỏi ngược), tóm tắt ghép từ chính câu học viên và học viên sửa được (G9); giảng viên xem log. Không chọn *automate* vì hard test "agent hiểu quá dễ" cho thấy chi phí sai của lời khen nhầm là cao và vô hình. Không chọn *augment toàn phần* (giảng viên duyệt từng câu hỏi ngược) vì mất tính tức thời của việc dạy lại và 448 học viên/cohort không có đủ giảng viên duyệt.
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX Toolkit, Microsoft; nút "Tái hiện" ở tab ④ của prototype nhảy đúng phần tử):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **G10 — Thu hẹp phạm vi khi nghi ngờ** (bắt buộc) | Tab ② mockup: khi engine/LLM trả `confidence=low` (vd "máy đoán chữ" ≈ "dự đoán token"?), tin nhắn Bi mang nhãn **"Bi chưa chắc"**, nội dung là **1 câu hỏi làm rõ đúng 1 ý** (không phán đúng/sai), kèm nút "Đúng ý đó rồi"; lượt hỏi ngược không bị trừ. Khi không có căn cứ (①) Bi dừng hẳn, nhãn "Không có căn cứ", nút "Gửi câu hỏi cho TA". Kịch bản tab ①: "② Low-confidence" và "① Failure". |
  | **G11 — Giải thích vì sao** | Mọi tin nhắn của Bi có nút **"Vì sao Bi hỏi?"** mở khung: ý nào đã nêu / còn thiếu, mã đoạn đối chiếu, vì sao Bi không nói đáp án; ở mode Live hiện thêm trường `why` của LLM và guard-rail nào đã can thiệp. Mã đoạn trong khung bấm được → nháy sáng đoạn nguồn ở cột trái. |
  | **G9 — Sửa dễ dàng** | Khi Bi "hiểu rồi", bản tóm tắt bằng lời học viên là **ô sửa trực tiếp** ("Bi hiểu sai ý mình → sửa" → "Lưu bản sửa"); bản sửa được đối chiếu lại với nguồn, ghi log `correction`. Sau câu hỏi làm rõ (G10) có "Đúng ý đó rồi" để xác nhận 1 chạm. Kịch bản tab ①: "Correction". |
  | **G8 — Gạt bỏ dễ dàng** | Mỗi câu hỏi ngược có nút **"Bỏ qua câu này"**: Bi không hỏi lại, **hoàn lại lượt**, chỉ ghi log `dismissed` cho giảng viên — học viên không mất gì. |
  | **G2 — Nói rõ hệ thống làm tốt đến đâu** | Thanh đầu màn hình ②: "Luyện tập · không chấm điểm · Bi có thể hiểu nhầm — bạn sửa được"; mỗi phản hồi đính nhãn tin cậy (cao / vừa / chưa chắc / không có căn cứ); badge MOCK/LIVE ở header cho biết Bi đang chạy rule hay LLM thật. |
  | **G16 — Nói rõ hậu quả hành động** | Trước "Gửi câu hỏi cho TA" và "Kết thúc phiên": hộp xác nhận nêu đúng thứ sẽ gửi/lưu (lời giải thích + log đối chiếu, **không có điểm số**), có nút Huỷ. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
*(Mỗi đường có kịch bản hoạt ảnh ở `codebase/index.html` tab ① và bấm thử được ở tab ② bằng menu "Điền mẫu nhanh". Điểm gọi AI duy nhất: bước "⚙ QUYẾT ĐỊNH AI: đối chiếu K1–K4 với transcript".)*

- **Happy path:** Học viên gõ lời giải thích bằng lời mình (có ≥3 ý, 1 ví dụ) → tiền kiểm rule OK → AI đối chiếu: K1 ✓ K2 ✓ K3 một phần K4 ✓, tin cậy cao → Bi hỏi ngược **câu 1/2 đúng vào K3** (không nói nội dung K3; nút "Vì sao Bi hỏi?" trỏ `[T06-138]`) → học viên bổ sung → K1–K4 ✓, đã trả lời 1 câu hỏi ngược → Bi "hiểu rồi", **nói lại bằng chính câu của học viên** (ô sửa được) → kết thúc: gợi ý xem lại (nếu còn ý một phần) + log cho giảng viên, không điểm số. *Kịch bản: "Happy path".*
- **Low-confidence (②):** Học viên giải thích **đúng nhưng khác từ ngữ tài liệu** ("máy đoán chữ… ghép chữ này sau chữ kia") → engine chỉ khớp từ đồng nghĩa yếu ⇒ `confidence=low` → **G10:** Bi không phán, gắn nhãn "Bi chưa chắc", hỏi làm rõ đúng 1 ý ("ý bạn là cách mô hình chọn chữ tiếp theo, hay ghép câu có sẵn?"), nút "Đúng ý đó rồi"; **không tính vào 2 lượt** → học viên xác nhận/nói rõ → K1 ✓ → tiếp tục như happy path; khi "hiểu rồi" Bi nói lại bằng đúng chữ "máy đoán chữ" của học viên (diễn đạt khác slide vẫn được công nhận — hard test 1). *Kịch bản: "② Low-confidence".*
- **Failure / không căn cứ (①):** Học viên giải thích bằng ý **không có trong 4 đoạn nguồn** (temperature, GPU làm tròn) → không khớp K1–K4, không khớp mẫu nhầm lẫn ⇒ `no_grounding` → Bi nói rõ *"mình không tìm thấy đoạn nào trong bài nói vậy nên không dám nói bạn đúng hay sai"*, nhãn "Không có căn cứ", trỏ `[T04-047]–[T04-048]` để xem lại, nút **"Gửi câu hỏi cho TA"** (có hộp xác nhận G16) → log gắn cờ `no_grounding`; học viên có thể nói lại để tiếp tục. Bi **không** đoán bừa — nếu phán lúc này thì chính Bi đang bịa. *Kịch bản: "① Failure".*
- **Correction (user sửa):** (a) Bi "hiểu rồi" nhưng tóm tắt sai 1 ý ("nó tra cứu dữ liệu huấn luyện lúc trả lời") → học viên bấm "Bi hiểu sai ý mình → sửa", sửa thẳng trong ô tóm tắt → bản sửa được đối chiếu lại với nguồn (khớp `[T04-047]`) → Bi cảm ơn, ghi nhận, **không tranh cãi**, log `correction`. (b) "Bỏ qua câu này" ở câu hỏi ngược → hoàn lại lượt, log `dismissed`. (c) "Đúng ý đó rồi" sau câu hỏi làm rõ → ý chuyển "đã nêu", log `confirm`. *Kịch bản: "Correction".*
- **Khi bị đòi ngoài phạm vi (③):** (a) **Dán nguyên transcript/slide** (trùng ≥45% 3-gram hoặc có mã đoạn) → Bi không đối chiếu, không cộng coverage: *"Nghe giống slide quá — bạn nói bằng lời của bạn được không?"*. (b) **Đòi đáp án / nhờ giải thích hộ** → Bi từ chối lộ đáp án (*"mình là học trò mà"*), chỉ trỏ mã đoạn `[T04-047]`; ở mode Live guard-rail trong code ép hành động này dù LLM có "lỡ" trả lời. (c) Hỏi chuyện ngoài bài → rơi vào ① không căn cứ. *Kịch bản: "③ Dán tài liệu / đòi đáp án".*
- **Case đặc thù domain (④):** (a) **Sai nhưng tự tin** ("LLM lên mạng tra Google… chắc chắn là vậy") → khớp mẫu nhầm lẫn, mâu thuẫn `[T04-047]` → Bi hỏi ngược bằng **phản ví dụ** ("lúc không có mạng nó có trả lời được không?"), không dùng chữ "sai", log `misconception`. (b) **Hết 2 lượt vẫn hổng** → Bi *"mình hiểu K1, K2 rồi nhưng K3, K4 mình chưa nghe bạn nói"* — chỉ nêu **tên** ý, không nêu nội dung — trỏ đoạn xem lại, nhắc "luyện tập mà", nút "Dạy tiếp (+1 lượt)" để học viên tự quyết. (c) **Agent hiểu quá dễ** → guard tiêu chí (≥3/4 ý · ≥1 ví dụ · trả lời ≥1 câu) chạy trong code; LLM trả `understood` khi chưa đủ sẽ bị hạ xuống `probe` và badge "guard-rail can thiệp" hiện cho người kiểm tra thấy. *Kịch bản: "④ Sai nhưng tự tin".*

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```
