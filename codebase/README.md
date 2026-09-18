# codebase/ — TeachBack Mentor prototype (CP3)

Trang tĩnh, không cần build. Mở [`index.html`](index.html) trực tiếp trong trình duyệt là dùng được tab ①–④. Riêng tab ⑤ Eval cần nạp `../eval/golden_set.json` nên chạy qua server local:

```bash
cd codebase
npm run serve
```

rồi mở `http://127.0.0.1:8000/`.

| Tab | Nội dung | Mock hay thật? |
|---|---|---|
| ① Luồng hoạt động | Sơ đồ SVG + hoạt ảnh 6 kịch bản (happy · ② low-confidence · ① no-grounding · correction · ④ sai-tự-tin · ③ dán tài liệu/đòi đáp án). Màn hình điện thoại bên phải mô phỏng đúng thứ học viên thấy ở từng bước. | Kịch bản **scripted** (dùng chính câu mẫu và engine của tab ②) |
| ② Dạy lại cho Bi (màn mặc định) | Màn "Dạy lại cho Bi": nguồn chuẩn 4 đoạn, coverage K1–K4, tiêu chí công bố, chat với Bi, hỏi ngược ≤2, nút G8/G9/G11, gợi ý xem lại, log cho giảng viên, gửi TA, kết thúc phiên. | **Chạy thật** (rule-based): tiền kiểm dán tài liệu/đòi đáp án, khớp K1–K4, phát hiện mẫu nhầm lẫn, tin cậy, giới hạn lượt, log. Persona Bi ở mode Mock là câu hỏi soạn sẵn theo ý. |
| ③ Cài đặt LLM | OpenAI · Anthropic · Gemini · OpenRouter · Custom (OpenAI-compatible: Ollama, 9Router local…), mỗi provider có base URL + model mặc định, nút kiểm tra kết nối, xem system prompt, panel trace các lời gọi. | Có key → **Working**: mỗi lượt là 1 lời gọi LLM thật (`decideLLM` trong `engine.js` → `ai-decision.js`), guard-rail vẫn chạy trong code. **Đã chạy lượt 1 live** với 9Router (`my-combo-mixture`): 16/25 — xem `eval/results-run1.md`. |
| ④ Spec & Nguyên tắc | Bảng §4b HAX (G10, G11, G9, G8, G2, G16) với nút **Tái hiện** → nhảy sang tab ② và nháy sáng phần tử tương ứng; bảng §6 4 đường đi → nút chạy hoạt ảnh; 5 user story rút gọn. | — |
| ⑤ Eval CP3 | Nạp `../eval/golden_set.json` (25 case), chạy MOCK hoặc LIVE, bảng PASS/FAIL từng case kèm lý do và trace, xuất JSON/Markdown. | Runner chính thức của `../eval/run1-*.json` (`TBM.runGoldenSet` + `evaluateCase` trong `engine.js`). |

## Ghi vết (trace) mỗi lượt — để xác minh lời gọi AI thật
Mỗi tin nhắn của Bi có nút **"Chi tiết kỹ thuật"** mở khung trace: mode (`live` / `mock` / `mock-fallback`), provider/model, `prompt_version`, độ trễ, guard-rail đã can thiệp (nếu có), **system prompt nguyên văn**, messages gửi đi, **raw response nguyên văn model trả về**, JSON đã parse (trước guard-rail). Khi đang gọi LLM, khung "Đang gọi <provider> / <model>… x.x s" đếm thời gian thật; LLM lỗi → toast "LLM lỗi → dùng engine mock" và badge trên tin nhắn, phiên không treo. Trace cũng nằm trong JSON phiên ("Sao chép JSON") và trong `eval/run1-live.json`.

## Phần giả lập (khai rõ)
- 4 đoạn nguồn là **trích lược/paraphrase** có mã đoạn (`T04-047`, `T04-048`, `T06-138`, `T06-139`), không dán data pack.
- "Gửi câu hỏi cho TA" và "lưu log cho giảng viên" chỉ ghi vào log trong trang (không có backend). Nút "Sao chép JSON" cho ra log thật của phiên.
- Không có đăng nhập / gắn vào VLearn thật.

## API key
Key chỉ lưu trong `localStorage` của trình duyệt đang mở. **Không commit key.** Với Ollama local cần `OLLAMA_ORIGINS=*` để cho phép CORS.

## File
- `index.html` — HTML + CSS, 5 tab, không dependency.
- `engine.js` — module quyết định thuần (không DOM): 4 đoạn nguồn, 4 ý K1–K4, mẫu nhầm lẫn, `analyze()/decide()` (rule), `systemPrompt()`, `decideLLM()` + guard-rail, `newState()/applyResult()`, `runGoldenSet()/evaluateCase()`. Export `window.TBM`.
- `ai-decision.js` — gửi request tới provider, giữ trace request/raw response trong `localStorage` (không chứa key).
- `app.js` — UI: tabs, hoạt ảnh tab ①, màn ② (chat, coverage, log, trace drawer), cấu hình tab ③, tab ④.
- `eval-tab.js` — tab ⑤ Eval.
- `WORKFLOW.md` — discovery (ask-why) → user stories (INVEST + Gherkin) → sơ đồ luồng mermaid.
- `package.json`, `scripts/`, `tests/` — lệnh chạy local và test của prototype.
- `src/` — khung production theo AI20K agent template để mở rộng sau; prototype hiện tại chưa dùng FastAPI/LangGraph.
- `docs/` — tài liệu thiết kế, plan, demo note và cấu trúc production tham khảo.

Lưu ý phiên bản: engine trên `main` có bản vá sau lượt 1 — xem `../eval/README.md` mục "Lưu ý phiên bản engine".
