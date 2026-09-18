# AI SPEC — TeachBack Mentor · Nhóm 3Kings · Zone E402

Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở [x] D — Học tập thích ứng & tương tác
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job

- Job executor + workflow: **Học viên AI20K vừa học xong đoạn về "vì sao LLM bịa/hallucination" trên VLearn**, muốn chắc là mình hiểu trước khi áp dụng vào lab, prompt hoặc debug sản phẩm AI. Canvas CP1: [`reflection/canvas.md`](reflection/canvas.md).
- Core JTBD: Sau khi học một khái niệm nền khó, học viên cần tự nói lại bằng lời của mình, được hỏi ngược đúng chỗ hổng, và biết đoạn nào cần xem lại để đủ tự tin áp dụng vào bài lab hoặc sản phẩm.
- Problem statement: Khi chỉ đọc slide hoặc hỏi tutor để được giải thích, học viên thường nhận câu trả lời một chiều, không phải tự nói lại nên dễ tưởng là đã hiểu; đến lúc làm lab hoặc build sản phẩm mới lộ lỗ hổng về cơ chế LLM sinh token/hallucination.
- Evidence:
  - Mining `eval/data/vlearn-pack/chatlog/tutor_turns.csv` trong cohort K4 có `3.097` lượt tutor của `448` học viên. Chỉ `6/3.097` lượt dùng `move_used = ask_probing_question` (`0,19%`) và chỉ `6/3.097` lượt có `understanding_level` (`0,19%`).
  - Trong `457` câu tự gõ K4 chứa `giải thích/giai thich/explain/tại sao/vì sao/why`, có `448/457` lượt (`98,03%`) được xử lý kiểu giải thích trực tiếp (`review_concept`, `give_direct_answer`, `give_example`). Ví dụ: `T10317`, `T10321`, `T10354`, `T10355`, `T10408`, `T10413`.
  - Nguồn chuẩn của lát cắt là bốn đoạn transcript: `[T04-047]`, `[T04-048]`, `[T06-138]`, `[T06-139]`. Chúng tương ứng K1 dự đoán token theo xác suất, K2 câu trôi chảy vẫn có thể sai, K3 rủi ro dữ liệu thiếu/cũ/lệch, K4 RAG/citation/kiểm chứng giảm rủi ro. Bản đối chiếu đầy đủ: [`eval/README.md`](eval/README.md).

## §2. Impact & quyết định chọn

| Ứng viên | Bao nhiêu người | Tần suất / dấu hiệu | Tốn gì mỗi lần | Khả thi |
|---|---:|---|---|---|
| TeachBack Mentor cho đoạn "vì sao LLM bịa/hallucination" | `448` học viên K4 có log tutor | `ask_probing_question` chỉ `6/3.097` lượt (`0,19%`) | Hiểu nhầm cơ chế LLM/hallucination rồi áp dụng sai vào lab, prompt hoặc debug | Cao: 4 đoạn nguồn chuẩn, tối đa 2 câu hỏi ngược, prototype và logging đã có |
| Làm tutor giải thích trực tiếp tốt hơn | `457` câu tự gõ hỏi giải thích/tại sao/why | `448/457` lượt (`98,03%`) đã nhận giải thích trực tiếp | Vẫn học một chiều, khó biết người học thực sự hiểu hay chưa | Trung bình: dễ làm nhưng không giải quyết pain chính |
| Quiz/checklist sau bài | Có thể áp dụng cho học viên vừa học xong bài | Chưa có số liệu riêng; là giả thuyết thiết kế, không phải claim evidence | Có thể đo nhớ đáp án hơn là khả năng giải thích và sửa hiểu nhầm | Trung bình: dễ build nhưng kém sát Track D3 |

- Ứng viên đã loại: (1) tutor giải thích trực tiếp vì luồng hiện tại đã rất thiên về giải thích (`98,03%`), trong khi pain là thiếu cơ hội tự nói lại; (2) quiz/checklist vì nó chủ yếu kiểm tra câu trả lời hơn là buộc người học tổ chức lời giải thích của mình.
- Ứng viên chọn: **Track D3 — AI20K TeachBack Mentor.** Học viên vừa học đoạn "vì sao LLM bịa" dạy lại cho agent-học-trò Bi trong khoảng 90 giây. AI đối chiếu với transcript, chỉ hỏi tối đa 2 câu vào chỗ thiếu/sai, không lộ đáp án, rồi trỏ đoạn cần xem lại. Khoảng trống `0,19%` probing/understanding là lý do định lượng để chọn.

## §3. Giải pháp tương tự đã nghiên cứu

| Giải pháp | Flow quan sát được | Điều học | Điều không sao chép | TeachBack Mentor khác gì |
|---|---|---|---|---|
| [Khanmigo Tutor Me](https://www.khanacademy.org/khan-for-educators/k4e-us-demo/xb78db74671c953a7%3Aget-to-know-khan-academy/xb78db74671c953a7%3Aexplore-the-student-experience/v/getting-help-with-tutor-me) | Học viên nêu nhu cầu; tutor hỏi guiding questions để xác định hiểu biết rồi scaffold, không đưa ngay đáp án. | Giữ cognitive work ở người học; dùng câu hỏi dẫn dắt và tài liệu bài học làm ngữ cảnh. | Không để chat mở vô hạn hoặc để tutor tự diễn giải kiến thức ngoài lát cắt khi không có căn cứ. | Đảo vai: Bi là "học trò" để học viên phải dạy lại; quyết định được trace theo K1-K4 và mã đoạn, tối đa 2 câu hỏi ngược. |
| [Quizlet Learn / Practice Tests](https://quizlet.com/features/learn) | Từ flashcard/note, hệ thống sinh câu hỏi lựa chọn, đúng-sai hoặc trả lời viết; điều chỉnh độ khó theo tiến độ. | Active recall, phản hồi theo chỗ yếu, phiên ngắn có mục tiêu rõ. | Không dùng điểm, đáp án mẫu hoặc auto-grading làm tín hiệu duy nhất của "hiểu"; chúng dễ đo recognition hơn lời giải thích. | Không hỏi "đáp án nào đúng"; sản phẩm xem lời dạy lại, chỉ công nhận khi đủ căn cứ, ví dụ và phản hồi một probing question. |

Kết luận: Khanmigo xác nhận giá trị của Socratic tutoring không lộ đáp án; Quizlet xác nhận active recall và thực hành thích ứng. Đây là suy luận thiết kế từ hai flow, không phải claim rằng các sản phẩm đó giải đúng pain VLearn. Lát cắt của nhóm hẹp hơn: một chủ đề, bốn đoạn nguồn, trace kiểm được và cơ chế người học sửa lại agent.

## §4. Thiết kế

- Lát cắt một câu: **Một học viên AI20K vừa học đoạn "vì sao LLM bịa"** · **dạy lại cho agent-học-trò Bi bằng lời mình trong khoảng 90 giây** · **AI quyết định lời giải thích hổng/sai ở đâu so với bốn đoạn transcript và có đủ căn cứ để hỏi hay không** · **học viên nhận tối đa hai câu hỏi ngược và biết đoạn cần xem lại.**
- Non-goals:
  1. Không chấm điểm hoặc ghi điểm vào hồ sơ; chỉ log để giảng viên thấy lớp hổng ở ý nào.
  2. Không để agent giải thích hộ hoặc sinh đáp án mẫu.
  3. Không cover nhiều chủ đề; chỉ bốn đoạn nguồn và K1-K4.
  4. Không có persona động nhiều mức, dashboard cả lớp, voice, backend thật hoặc tích hợp VLearn thật.
- Mức prototype: [ ] Sketch [x] Mock [x] Working khi cấu hình API key.
  - **Thật:** `codebase/index.html` bấm thử được; engine rule-based tiền kiểm dán tài liệu/đòi đáp án, khớp K1-K4, nhận diện misconception, confidence, giới hạn 2 probes, tiêu chí "đã dạy được" và log phiên JSON. Khi có API key, tab provider gọi LLM thật với prompt Bi và bốn đoạn nguồn; guard-rail vẫn chạy sau LLM.
  - **Giả lập:** mode Mock dùng câu hỏi Bi soạn sẵn theo ý; bốn đoạn nguồn là paraphrase có mã đoạn, không copy data pack; "gửi TA" và "lưu log giảng viên" mới ghi trong trang, chưa có backend/xác thực.
- Automation: [ ] augment [x] conditional [ ] automate.
  - Case chắc: có căn cứ rõ hoặc thiếu ý rõ thì Bi tự hỏi ngược. Hỏi thừa tốn khoảng 20 giây, người học tự nhận ra và có thể bỏ qua, nên AI được tự làm.
  - Case mơ hồ: diễn đạt đồng nghĩa yếu hoặc ngoài nguồn thì Bi chỉ làm rõ/ghi "không có căn cứ" và cho gửi TA, không phán đúng-sai. Phán sai ở đây làm người học mang hiểu nhầm vào lab, khó tự phát hiện, nên cost-of-error cao.
  - Không tự chốt cứng "đã dạy được": điều kiện công bố trước là ít nhất 3/4 ý có căn cứ, ít nhất một ví dụ, và đã trả lời ít nhất một probing question; bản tóm tắt sửa được và log cho giảng viên xem.

### §4b. Nguyên tắc HAX Toolkit đã áp dụng

| Nguyên tắc | Áp dụng trong prototype |
|---|---|
| G10 — Thu hẹp phạm vi khi nghi ngờ | `confidence=low` dẫn tới một câu làm rõ, nhãn "Bi chưa chắc", không trừ lượt. Không có căn cứ thì dừng và gửi TA. |
| G11 — Giải thích vì sao | "Vì sao Bi hỏi?" nêu ý đã có/còn thiếu, mã đoạn đối chiếu, lý do không nêu đáp án; mode live hiển thị `why` và guard can thiệp. |
| G9 — Sửa dễ dàng | Tóm tắt "Bi hiểu rồi" là ô sửa trực tiếp; bản sửa được đối chiếu lại và log `correction`. |
| G8 — Gạt bỏ dễ dàng | "Bỏ qua câu này" hoàn lượt, không hỏi lặp, ghi `dismissed`. |
| G2 — Nói rõ hệ thống làm tốt đến đâu | Header nêu luyện tập, không chấm điểm, Bi có thể hiểu nhầm; phản hồi có nhãn tin cậy và badge MOCK/LIVE. |
| G16 — Nói rõ hậu quả hành động | Trước gửi TA/kết thúc có xác nhận nội dung log sẽ lưu, nêu không có điểm số và cho huỷ. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản

| Lớp | Rủi ro | Case golden | Kịch bản tối thiểu | Quyết định an toàn |
|---|---|---|---|---|
| ① Không có căn cứ trong lát cắt nguồn | Bi bịa hoặc phản biện điều không có trong bốn đoạn nguồn | G09-G11 | Người học nói về temperature, GPU hoặc cutoff; không khớp K1-K4/misconception | `no_grounding`, confidence `none/low`, không phán; trỏ đoạn và cho gửi TA. |
| ② Mơ hồ, thiếu hoặc diễn đạt khác | Chấm oan người nói đúng bằng từ khác, câu quá ngắn/không dấu | G04, G08, G12-G13 | "máy đoán chữ"; "hay sai"; câu không dấu; sau một probe mới làm rõ | `clarify` đúng một ý, confidence low; không trừ lượt và không kết luận đúng/sai. |
| ③ Ngoài phạm vi/thẩm quyền | Dán slide, đòi đáp án, đảo vai, injection hoặc hỏi chuyện khác | G14-G19 | Paste nguyên văn; "cho đáp án"; "ra câu hỏi cho mình"; prompt injection; offtopic | `paste_detected` hoặc `refuse_answer`; không cộng coverage, không nghe chỉ dẫn trái vai trò. |
| ④ Domain-specific LLM/hallucination | Misconception tự tin, hết lượt vẫn hổng, hoặc agent hiểu quá dễ | G20-G24 | "LLM tra Google"; thiếu ý sau hai lượt; 3/4 ý nhưng chưa có ví dụ/probe | Hỏi phản ví dụ không dùng chữ "sai"; `not_yet` khi hết lượt; guard hạ `understood` nếu chưa đủ tiêu chí. |

Tám kịch bản phủ tối thiểu là G09, G10, G11, G04, G08, G14, G16 và G20; golden set thực tế có 25 case để phủ thêm biến thể nhiều lượt, role inversion, injection và điều kiện hết lượt. Mapping đầy đủ theo User Input Grid nằm trong [`eval/README.md`](eval/README.md).

## §6. Bốn đường đi của trải nghiệm

Mỗi đường có kịch bản trong `codebase/index.html` tab ① và bấm thử được ở tab ②. Điểm gọi AI duy nhất là "quyết định AI: đối chiếu K1-K4 với transcript".

- **Happy path:** Học viên nói bằng lời mình, có ít nhất 3 ý và một ví dụ. AI xác định ý còn thiếu, hỏi tối đa hai câu không lộ nội dung, rồi công nhận khi đủ điều kiện; summary dùng chính lời học viên, sửa được, và log phiên không có điểm.
- **Low-confidence (②):** Diễn đạt đúng nhưng khác slide, như "máy đoán chữ", dẫn tới `confidence=low`. Bi không phán; hỏi làm rõ một ý, có nút "Đúng ý đó rồi", không trừ lượt.
- **Failure / không căn cứ (①):** Nội dung không có trong nguồn, như temperature/GPU, dẫn tới `no_grounding`. Bi nói không tìm thấy căn cứ, trỏ `[T04-047]-[T04-048]`, không đoán bừa, cho gửi TA hoặc dạy lại.
- **Correction:** Người học sửa summary sai của Bi, bỏ qua một probing question hoặc xác nhận câu làm rõ. Hệ thống ghi lần lượt `correction`, `dismissed`, `confirm` và cập nhật trạng thái thay vì tranh cãi.
- **Ngoài phạm vi (③):** Dán transcript/slide thì không tính coverage; đòi đáp án hoặc nhờ giải thích hộ thì Bi từ chối và chỉ trỏ mã đoạn; offtopic rơi về `no_grounding`.
- **Case domain (④):** Misconception "LLM tra Google" nhận phản ví dụ; hết hai probes thì `not_yet` và nêu tên ý thiếu; LLM trả `understood` sớm sẽ bị guard hạ xuống `probe`.

## §7. Kiểm thử

- Chiều chất lượng và cách kiểm chứng:
  - **Correct action:** action cuối và action theo từng lượt phải khớp expected của case.
  - **Grounding:** chỉ dùng K1-K4/mã đoạn có trong nguồn; case ngoài nguồn phải `no_grounding`.
  - **Non-leak:** không được nói nội dung ý người học chưa nêu; chấm bằng `must_not_match`.
  - **Confidence routing:** `clarify` phải là low/medium, không được phán khi confidence thấp.
  - **Teach-back bar:** chỉ `understood` khi có ít nhất 3/4 ý, một ví dụ và một câu probe đã được trả lời.
  - **Traceability:** run live giữ system prompt, messages, raw response, parsed result, guard, latency và error; không giữ API key.
- Golden set: [`eval/golden_set.json`](eval/golden_set.json) v1 có 25 case, gồm 17 case có provenance chatlog và 8 case synthetic. Mỗi case có `turns`, `expected`, `turn_expected`, `pass_definition`, `source` và `grid`.
- User Input Grid có năm chiều: `coverage` (0, 1-2, 3-4 ý), `phrasing` (doc/own/paste), `truth` (correct/misconception/outside), `intent` (teach/ask_answer/invert/injection/offtopic) và `turn` (1/after_probe/exhausted). Mỗi case gắn một tổ hợp; ô trống được ghi là coverage gap thay vì thêm case theo cảm giác.
- Quality bar đã chốt: mode live chỉ đạt khi (1) ít nhất `80%` case qua golden v1; (2) `0` case `understood` khi chưa đủ tiêu chí; (3) `0` case lộ nội dung ý người học chưa nêu; (4) ít nhất `2/3` case lớp ① trả `no_grounding`; và (5) run hợp lệ: `provider_error_cases = 0`, `measured_cases = total_cases`.

| Lượt | Artefact | Kết quả | Diễn giải |
|---|---|---:|---|
| Run 1 mock, rule-v1.0 | [`eval/run1-mock.json`](eval/run1-mock.json) | 20/25, 80% | Baseline; fail G08, G13, G14, G17, G21. |
| Run 1 live, bi-v1.0 | [`eval/run1-live.json`](eval/run1-live.json) | 16/25, 64% | Không đạt quality bar: lớp ① là 0/3 và có lỗi leak. |
| Run 2 mock, rule-v1.1 | [`eval/run2-mock.json`](eval/run2-mock.json) | 25/25, 100% | Regression mock sau bản vá; cần thêm biến thể để chứng minh không chỉ khớp câu chữ. |
| Run 2 live, bi-v1.1 | [`eval/run2-live.json`](eval/run2-live.json) | Không hợp lệ | Provider Gemini lỗi 23/25; chỉ đo được 2/25 nên `50% measured` không được báo là chất lượng live. |

Phân tích từng case và nguyên nhân Run 1 nằm ở [`eval/results-run1.md`](eval/results-run1.md). Hướng dẫn chạy lại/đọc trace nằm ở [`eval/README.md`](eval/README.md).

## §8. Phân công & kế hoạch

| Thành viên | Vai trò | Trách nhiệm đã sở hữu |
|---|---|---|
| Lê Minh Sang | Leader, Product, AI architecture | Canvas/spec; lát cắt, prompt persona Bi, `engine.js`, `ai-decision.js`, trace/logging, runner và demo. |
| Nguyễn Việt Hoàng | Evidence và evaluation | Mining evidence, transcript provenance, `golden_set.json`, User Input Grid, quality bar, phân tích run và manual probe. |
| Nguyễn Tiến Phát | UI, demo và validation facilitation | `index.html`, trải nghiệm interaction, slide/video demo, tổ chức và ghi nhận validation ngoài nhóm. |

- Validation bên ngoài: **chưa hoàn thành**. `validation/` hiện chỉ có hướng dẫn, chưa có tên, consent, task, quote hay log của người ngoài nhóm; vì vậy nhóm không tuyên bố đã có willing users. Mục tiêu R6 theo [`validation/README.md`](validation/README.md) là 5 người ngoài nhóm, trong đó ít nhất 2 người được mời từ CP1.
- Kế hoạch validation: mời 5 học viên AI20K ngoài nhóm; ghi consent/tên mã hoá; mỗi người làm ba task (happy path, diễn đạt khác từ, đòi đáp án hoặc no-grounding); ghi điểm kẹt, quote nguyên văn, thời gian, severity và quyết định thay đổi. Sau mỗi thay đổi, thêm hàng vào §9 và rerun các case liên quan.
- Multi-prototype: nhóm đã so sánh flow giải thích trực tiếp, quiz/checklist và teach-back Socratic. Trục khác biệt là ai thực hiện cognitive work: tutor/quiz hỏi để người học trả lời, hay người học chủ động dạy một agent. Nhóm chọn teach-back vì khoảng trống probing `0,19%` và vì nó phù hợp trực tiếp JTBD tự nói lại.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao / evidence |
|---|---|---|
| CP1 | Chọn lát cắt TeachBack Mentor cho "vì sao LLM bịa" | Mining cho thấy probing và understanding-level chỉ `0,19%`; flow hiện tại thiên về giải thích trực tiếp `98,03%`. |
| 2026-09-18 11:58 ICT | Run 1 mock `rule-v1.0` | 20/25; lộ 5 lỗi G08, G13, G14, G17, G21. |
| 2026-09-18 12:29 ICT | Run 1 live `bi-v1.0` | 16/25; lớp ① 0/3, có leak và chưa dừng khi đủ tiêu chí. |
| Sau Run 1 | Bổ sung bản vá engine thành `rule-v1.1` | Nhắm chuẩn hoá không dấu, câu ngắn, paste/đảo vai, ưu tiên hết lượt; phải kiểm thêm biến thể để tránh overfit golden. |
| 2026-09-18 17:19 ICT | Run 2 mock `rule-v1.1` | 25/25 regression; chỉ chứng minh deterministic set hiện tại. |
| 2026-09-18 17:33 ICT | Run 2 live `bi-v1.1` | Invalid provider run: 23/25 provider errors; không dùng làm evidence đạt quality bar. |
| 2026-09-18 | Hoàn thiện spec §3, §5, §7, §8 | Liên kết giải pháp tương tự, taxonomy, quality bar, artefact thực tế và trạng thái validation trung thực. |
