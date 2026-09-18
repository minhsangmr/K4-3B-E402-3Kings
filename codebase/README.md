# codebase/ — TeachBack Mentor prototype (CP2)

Một file tĩnh, không cần build: mở [`index.html`](index.html) trực tiếp trong trình duyệt (double-click hoặc `open codebase/index.html`).

| Tab | Nội dung | Mock hay thật? |
|---|---|---|
| ① Luồng hoạt động | Sơ đồ SVG + hoạt ảnh 6 kịch bản (happy · ② low-confidence · ① no-grounding · correction · ④ sai-tự-tin · ③ dán tài liệu/đòi đáp án). Màn hình điện thoại bên phải mô phỏng đúng thứ học viên thấy ở từng bước. | Kịch bản **scripted** (dùng chính câu mẫu và engine của tab ②) |
| ② Mockup giao diện | Màn "Dạy lại cho Bi": nguồn chuẩn 4 đoạn, coverage K1–K4, tiêu chí công bố, chat với Bi, hỏi ngược ≤2, nút G8/G9/G11, gợi ý xem lại, log cho giảng viên, gửi TA, kết thúc phiên. | **Chạy thật** (rule-based): tiền kiểm dán tài liệu/đòi đáp án, khớp K1–K4, phát hiện mẫu nhầm lẫn, tin cậy, giới hạn lượt, log. Persona Bi ở mode Mock là câu hỏi soạn sẵn theo ý. |
| ③ Cài đặt LLM | OpenAI · Anthropic · Gemini · OpenRouter · 9Router · Custom (OpenAI-compatible, vd Ollama), mỗi provider có base URL + model mặc định, nút kiểm tra kết nối, xem system prompt. | Có key → **Working**: mỗi lượt là 1 lời gọi LLM thật, guard-rail vẫn chạy trong code. |
| ④ Spec & Nguyên tắc | Bảng §4b HAX (G10, G11, G9, G8, G2, G16) với nút **Tái hiện** → nhảy sang tab ② và nháy sáng phần tử tương ứng; bảng §6 4 đường đi → nút chạy hoạt ảnh; 5 user story rút gọn. | — |

## Phần giả lập (khai rõ)
- 4 đoạn nguồn là **trích lược/paraphrase** có mã đoạn (`T04-047`, `T04-048`, `T06-138`, `T06-139`), không dán data pack.
- "Gửi câu hỏi cho TA" và "lưu log cho giảng viên" chỉ ghi vào log trong trang (không có backend). Nút "Sao chép JSON" cho ra log thật của phiên.
- Không có đăng nhập / gắn vào VLearn thật.

## API key
Key chỉ lưu trong `localStorage` của trình duyệt đang mở. **Không commit key.** Với Ollama local cần `OLLAMA_ORIGINS=*` để cho phép CORS.

| Provider | Base URL | Request | Response text |
|---|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `POST /chat/completions` · `{model, temperature, messages}` | `choices[0].message.content` |
| Anthropic | `https://api.anthropic.com/v1` | `POST /messages` · `{model, system, messages}` | `content[].text` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta` | `POST /models/{model}:generateContent` · `{system_instruction, contents}` | `candidates[0].content.parts[].text` |
| OpenRouter | `https://openrouter.ai/api/v1` | OpenAI-compatible `POST /chat/completions` | `choices[0].message.content` |
| 9Router | cloud `https://9router.com/v1`; local `http://localhost:20128/v1` | OpenAI-compatible `POST /chat/completions` | `choices[0].message.content` |

Biến mẫu cho key, model và `base_url` của từng provider nằm trong [`.env.example`](../.env.example). Prototype tĩnh không tự đọc `.env`; hãy nhập cấu hình ở tab ③.

## File
- `index.html` — toàn bộ prototype (HTML/CSS/JS, không dependency).
- `WORKFLOW.md` — discovery (ask-why) → user stories (INVEST + Gherkin) → sơ đồ luồng mermaid.
