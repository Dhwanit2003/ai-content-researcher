from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.services.research_pipeline import run_pipeline

router = APIRouter()


class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500)


@router.post("/research/stream")
async def stream_research(req: ResearchRequest):
    """Stream the 4-step research pipeline via Server-Sent Events."""
    return StreamingResponse(
        run_pipeline(req.topic),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
