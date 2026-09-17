# Canvas CP1 — Track D3 · AI20K TeachBack Mentor

Nhóm: **3Kings**  
Hướng chọn: **Track D3 — Học bằng cách dạy: học viên dạy lại cho agent**

| # | Dòng | Nội dung |
|---|---|---|
| 1 | Track + đề | **Track D3 — AI20K TeachBack Mentor.** Một agent "học trò" trên VLearn để học viên AI20K dạy lại khái niệm vừa học; agent hỏi ngược đúng chỗ hổng và chỉ công nhận "đã dạy được" khi lời giải thích đủ đúng theo transcript/slide. |
| 2 | Job executor | **Học viên AI20K vừa học xong đoạn về "vì sao LLM bịa/hallucination" trên VLearn**, đang muốn chắc là mình hiểu trước khi đem kiến thức đó vào lab/prompt/debug sản phẩm AI. |
| 3 | Pain một câu | Khi chỉ đọc slide hoặc hỏi tutor để được giải thích, học viên thường nhận một câu trả lời một chiều, không phải tự nói lại nên dễ tưởng là đã hiểu; hậu quả là khi làm lab hoặc build sản phẩm, bạn không nhận ra lỗ hổng về cơ chế LLM sinh token/hallucination cho đến lúc áp dụng sai. |
| 4 | 1-2 bằng chứng đầu | **Evidence mining từ `data/vlearn-pack/chatlog/tutor_turns.csv`:** trong cohort K4 có `3.097` lượt tutor của `448` học viên, nhưng chỉ `6/3.097` lượt dùng `move_used = ask_probing_question` (`0,19%`) và chỉ `6/3.097` lượt có `understanding_level` (`0,19%`). Trong `457` câu tự gõ K4 có từ khóa `giải thích/giai thich/explain/tại sao/vì sao/why`, `448/457` lượt (`98,03%`) được xử lý kiểu trả lời/giải thích trực tiếp (`review_concept`, `give_direct_answer`, `give_example`). Ví dụ kiểm được: `T10317`, `T10321`, `T10354`, `T10355`, `T10408`, `T10413`. **Nguồn bài học cho lát cắt:** transcript có đoạn nêu LLM dự đoán token và có thể hallucinate vì sinh chuỗi theo xác suất (`[T04-047]`, `[T04-048]`), cùng đoạn giải thích hallucination do bias dữ liệu, fine-tuning/RLHF và cần RAG/citation để giảm rủi ro (`[T06-138]`, `[T06-139]`). |
| 5 | Lát cắt MỘT CÂU | Một học viên vừa học đoạn "vì sao LLM bịa" · dạy lại cho agent-học-trò trong 90 giây · AI đối chiếu lời giải thích với transcript và quyết định hỏi ngược tối đa 2 câu vào chỗ thiếu/sai mà không lộ đáp án · kết quả là học viên bổ sung được cơ chế + ví dụ đúng và biết đoạn nào cần xem lại. |
| 6 | AI tự làm đến đâu + lý do + willing users | **Mức automation: Conditional/Augment.** AI tự nhận diện các ý bắt buộc trong lời dạy lại: LLM dự đoán token, xác suất/temperature/context, hallucination không phải "biết thật", bias dữ liệu, và vai trò của grounding/citation; AI tự hỏi ngược khi thiếu hoặc sai, rồi gợi ý đoạn transcript cần xem lại. AI **không** giảng thay từ đầu, không cho đáp án trước, không chấm điểm ngầm, không kết luận năng lực học viên, và không suy diễn ngoài nguồn. **Lý do:** sai ở đây làm học viên học sai kiến thức nền, nên agent chỉ là bạn học luyện phản biện, còn học viên phải tự sửa lời giải thích. **Willing users dự kiến ngoài nhóm:** chốt ngay tại CP1/giờ nghỉ với 3 học viên AI20K khác nhóm; khi có consent sẽ ghi tên và log vào `validation/` thay vì bịa tên trong canvas. |
| 7 | Phân công có tên | **Lê Minh Sang — 2A202602864 — Leader/Product/AI architecture:** owner canvas + spec, định nghĩa learning criteria, thiết kế prompt/flow TeachBack, chuẩn bị demo. **Nguyễn Việt Hoàng — 2A202602424:** mining evidence từ chatlog/transcript, ghi phương pháp đếm, chọn ví dụ `turn_id`, xây golden set và quality bar. **Nguyễn Tiến Pháp — 2A202602387:** prototype UI/interaction, logging phiên dạy lại, tổ chức validation với willing users, làm video/demo backup. |

## Ghi chú kiểm chứng nhanh

- Track D3 và các ràng buộc về học tập/validation lấy từ `tracks/track-d-adaptive-interactive-learning.md`.
- Canvas bám scaffold 7 dòng trong `examples/canvas-cp1.md` và `02-guide.md` §1.5.
- Cách đếm evidence: lọc `cohort_hint = K4`; đếm `move_used`, `understanding_level`; lọc câu tự gõ (`is_preset = False`) có regex `giải\s*thích|giai\s*thich|explain|tại sao|vì sao|why`; trong nhóm này đếm các phản hồi có `move_used` thuộc `review_concept`, `give_direct_answer`, `give_example`.
