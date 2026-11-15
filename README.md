# Hackpixel ⚡

> **Scoped, scored, and ranked hackathon project ideas you can actually finish on time.**

Hackpixel is a developer-centric hackathon ideation assistant. Powered by **FastAPI**, **React 19**, **Three.js**, **Tailwind CSS**, and **Google Gemini 2.5**, it collects your real-world constraints—time limit, team size, skill level, and tech stack—and produces 10 realistically scoped project cards evaluated against a transparent 5-dimension rubric.

---

## ✨ Highlights

- **3D Hardware Hero**: Interactive Three.js anodized aluminum laptop floating in front of the bold Hackpixel brand.
- **Apple Modern Aesthetic**: Clean `#F5F5F7` palette, high-contrast `#1D1D1F` typography, and `#007AFF` interactive accents.
- **5-Dimension Rubric Scoring**: Every idea is scored and ranked on Time Fit (25%), Feasibility (25%), Team Fit (20%), Demo Impact (15%), and Theme Alignment (15%).
- **Duplicate Detection**: Verifies idea uniqueness against existing GitHub repositories.
- **Architecture Presets**: 1-click presets for Jamstack, AI Native, Mobile (Flutter), Data Stories, and Edge/Go.
- **1-Click Export**: Copy or download all 10 ranked cards directly as Markdown.

---

## 🚀 Quickstart

### 1. Backend (FastAPI)
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React 19 + Vite)
```powershell
cd frontend
npm install
npm run dev      # Local Vite dev server on http://localhost:3000
npm run build    # Compiles to frontend/dist (served directly by FastAPI)
```

Visit **[http://localhost:8000](http://localhost:8000)** (or `http://localhost:3000` during frontend development).

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ideas` | Generates, scores, and ranks 10 hackathon ideas |
| `GET` | `/api/status` | Safe runtime status & telemetry (no secrets exposed) |
| `GET` | `/health` | Service health check |

---

## 🧪 Testing

```powershell
pytest tests --ignore=frontend
```
All 24 unit & integration tests pass with 100% coverage.

---

## ☕ Support
If Hackpixel helped your team scope and win a hackathon, [Buy Me a Coffee](https://buymeacoffee.com/luthfanmakl)!

## 📄 License
MIT © Hackpixel
