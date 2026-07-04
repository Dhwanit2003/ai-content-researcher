from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import research

app = FastAPI(title="AI Content Researcher", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-content-researcher.vercel.app"],  # tighten to your Vercel domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research.router, prefix="/api/v1", tags=["research"])


@app.get("/health")
async def health():
    return {"status": "ok"}
