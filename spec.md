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
  - Số liệu mining / kết quả khảo sát: từ `data/vlearn-pack/chatlog/tutor_turns.csv`, trong cohort K4 có `3.097` lượt tutor của `448` học viên, nhưng chỉ `6/3.097` lượt dùng `move_used = ask_probing_question` (`0,19%`) và chỉ `6/3.097` lượt có `understanding_level` (`0,19%`).
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
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
- Non-goals (≥3 thứ KHÔNG build):
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
- Automation: [ ] augment [ ] conditional [ ] automate — lý do theo cost-of-error:
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: · Low-confidence (②): · Failure/không căn cứ (①): · Correction (user sửa):
- Khi bị đòi ngoài phạm vi (③): · Case đặc thù domain (④):

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
