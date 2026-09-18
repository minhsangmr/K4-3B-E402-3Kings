# Demo video — CP3 thao tác thật, 30 giây

| | |
|---|---|
| File | `cp3-thao-tac-30s.mp4` *(thêm sau khi quay; nếu > 25 MB thì chỉ để link)* |
| Link dự phòng (Google Drive, anyone with link) | *(dán link)* |
| Quay lúc | 18/9/2026, __:__ |
| Mode | **LIVE** — provider `____` · model `____` · prompt `bi-v1.0` |
| Người quay | Nguyễn Tiến Phát |

## Có gì trong video (không dựng, không lồng tiếng)

| Giây | Thao tác | Bằng chứng trên màn hình |
|---|---|---|
| 0–3 | Mở tab ② "Dạy lại cho Bi", persona *Mới học* | Badge **LIVE · provider / model**; "Luyện tập · không chấm điểm"; 4 đoạn nguồn; K1–K4 "chưa nhắc" |
| 3–8 | "Điền mẫu nhanh" → *happy* → Gửi | Bong bóng học viên; khung **"Đang gọi … x.x s"** đếm thời gian thật |
| 8–15 | Bi trả lời (hỏi ngược vào ý còn hổng) | Chip tin cậy; coverage nhảy "đã nêu"; "Hỏi ngược 1/2"; badge `LLM · model` |
| 15–20 | Bấm **"Chi tiết kỹ thuật"** | Trace: provider/model, độ trễ, **raw response nguyên văn** từ model, system prompt |
| 20–27 | Gửi *happy2* | "Mình hiểu rồi! Để mình nói lại…" + tóm tắt bằng lời học viên, nút "Bi hiểu sai ý mình → sửa" |
| 27–30 | Nhật ký phiên (cột phải) | Dòng `understood · conf=high · llm` |

Cách kiểm tra lại: chạy `cd codebase && npm run serve`, mở tab ③ nhập key (chỉ lưu localStorage), bật Live, lặp đúng các bước trên. Số đo đi kèm video: `eval/results-run1.md`.
