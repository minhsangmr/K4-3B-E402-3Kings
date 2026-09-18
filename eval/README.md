# TeachBack Mentor eval

## Cách chạy lại (runner)

1. Tại gốc repo, chạy `python3 -m http.server 8000`.
2. Mở `http://localhost:8000/codebase/`, chọn tab ⑤ Eval và bấm "Nạp eval/golden_set.json". Khi mở bằng `file://`, hãy chọn file JSON bằng ô chọn file.
3. Chọn `mock` để chạy rule engine. Muốn chạy `live`, vào tab ③, chọn provider, kiểm tra `base_url`/model, nhập API key rồi bấm "Lưu & bật chế độ Live". Key chỉ nằm trong `localStorage` của trình duyệt.
4. Bấm "Chạy", theo dõi tiến độ, rồi xuất `run-<mode>-<YYYYMMDD-HHMM>.json` hoặc file Markdown tương ứng.

Các provider có sẵn: OpenAI, Anthropic, Gemini, OpenRouter, 9Router và Custom OpenAI-compatible. Giá trị mẫu cùng cấu trúc request/response nằm trong `.env.example`; prototype tĩnh không tự đọc file `.env`.
