# Production Structure

Chuẩn nộp bài 3Kings là chuẩn top-level của repo. Cấu trúc production trong `ai20k-agent-template-main.zip` được lồng vào `codebase/` để không làm lệch cây nộp bài.

Mapping hiện tại:

| Template production | Trong repo 3Kings |
|---|---|
| `src/agents/`, `src/api/`, `src/models/`, `src/services/` | `codebase/src/` |
| `tests/` | `codebase/tests/` |
| `docs/architecture`, `docs/api`, `docs/adr` | `codebase/docs/` |
| `.env.example` | `codebase/.env.example` |
| `package.json`, `scripts/` | `codebase/package.json`, `codebase/scripts/` |
| `eval/` | Giữ ở top-level `eval/` theo sổ tay 3Kings |

Prototype hiện tại là web tĩnh, không phải FastAPI/LangGraph app. Vì vậy `codebase/src/` là khung mở rộng, còn phần chạy thật nằm ở `index.html`, `engine.js`, `app.js`, `ai-decision.js`, `eval-tab.js`.
