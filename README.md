# AI Content Researcher SaaS 
Project Live Link = {https://ai-content-researcher.vercel.app/}

An AI-powered research tool that turns any topic into a comprehensive report in seconds using a 4-step LLM pipeline.

**Stack:** FastAPI · Groq (Llama 3.3 70B) · Tavily Search · React · Vite · Tailwind CSS

**Deploy:** Railway (backend) · Vercel (frontend)

---

## Pipeline

```
Topic → [1] Query Decomposition → [2] Web Search (Tavily) → [3] Per-Query Synthesis (Groq) → [4] Final Report (Groq)
```

Each step streams back to the UI via Server-Sent Events.

---

## Local Development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your API keys
uvicorn app.main:app --reload
# → http://localhost:8000
```

Get your keys:
- **GROQ_API_KEY** → https://console.groq.com
- **TAVILY_API_KEY** → https://tavily.com

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set VITE_API_URL=http://localhost:8000
npm run dev
# → http://localhost:5173
```

---

## Deploy

### Backend → Railway

1. Go to https://railway.app → New Project → Deploy from GitHub repo
2. Set root directory to `backend/`
3. Add environment variables: `GROQ_API_KEY`, `TAVILY_API_KEY`
4. Railway auto-detects `Procfile` and deploys
5. Copy the generated Railway URL (e.g. `https://xxx.up.railway.app`)

### Frontend → Vercel

1. Go to https://vercel.com → New Project → Import GitHub repo
2. Set root directory to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
4. Deploy → Done

### Update CORS

Once deployed, tighten CORS in `backend/app/main.py`:

```python
allow_origins=["https://your-vercel-app.vercel.app"]
```

---

## API

```
POST /api/v1/research/stream
Content-Type: application/json

{ "topic": "your research topic here" }

→ text/event-stream (SSE)
```

### SSE Events

| Step | Payload |
|------|---------|
| `start` | `{ message }` |
| `step1_done` | `{ queries: string[] }` |
| `step2_done` | `{ message }` |
| `step3_done` | `{ syntheses: string[] }` |
| `complete` | `{ report: string, sources: [{title, url}] }` |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/research.py
│   │   └── services/research_pipeline.py
│   ├── requirements.txt
│   ├── Procfile
│   └── railway.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── hooks/useResearch.js
│   │   └── index.css
│   ├── vite.config.js
│   └── vercel.json
└── .github/workflows/ci.yml
```
