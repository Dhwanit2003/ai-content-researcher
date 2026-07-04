import asyncio
import os
from groq import AsyncGroq
from tavily import TavilyClient
from typing import AsyncGenerator
import json

groq_client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

GROQ_MODEL = "llama-3.3-70b-versatile"


# ── Step 1: Decompose topic into sub-queries ──────────────────────────────────
async def decompose_query(topic: str) -> list[str]:
    resp = await groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a research strategist. Given a topic, output a JSON array "
                    "of 4-5 focused search queries that together cover the topic comprehensively. "
                    "Return ONLY the JSON array, no other text."
                ),
            },
            {"role": "user", "content": f"Topic: {topic}"},
        ],
        temperature=0.3,
        max_tokens=300,
    )
    raw = resp.choices[0].message.content.strip()
    return json.loads(raw)


# ── Step 2: Search the web for each sub-query ─────────────────────────────────
async def search_web(queries: list) -> list[dict]:
    results = []
    for q in queries:
        # force to plain string no matter what Groq returned
        if isinstance(q, dict):
            q = q.get("query") or q.get("text") or list(q.values())[0]
        q = str(q).strip()
        print(f"[Tavily] searching: {repr(q)}")  # debug
        r = tavily_client.search(query=q, max_results=3, search_depth="basic")
        results.append({"query": q, "results": r.get("results", [])})
    return results


# ── Step 3: Synthesize each query's results ───────────────────────────────────
async def synthesize_results(search_data: list[dict]) -> list[dict]:
    async def synthesize_one(item: dict) -> dict:
        snippets = "\n\n".join(
            f"[{r['title']}]: {r['content']}" for r in item["results"]
        )
        resp = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a research analyst. Synthesize the provided search results "
                        "into a concise, factual summary paragraph. Cite key insights only."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Query: {item['query']}\n\nSearch results:\n{snippets}",
                },
            ],
            temperature=0.4,
            max_tokens=400,
        )
        return {
            "query": item["query"],
            "synthesis": resp.choices[0].message.content.strip(),
            "sources": [{"title": r["title"], "url": r["url"]} for r in item["results"]],
        }

    return await asyncio.gather(*[synthesize_one(item) for item in search_data])


# ── Step 4: Generate final markdown report ────────────────────────────────────
async def generate_report(topic: str, syntheses: list[dict]) -> str:
    sections = "\n\n".join(
        f"### {s['query']}\n{s['synthesis']}" for s in syntheses
    )
    resp = await groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a senior content writer. Write a comprehensive, well-structured "
                    "research report in Markdown based on the provided research sections. "
                    "Include an executive summary, key findings, and conclusion. "
                    "Use headers, bullet points, and bold for key terms."
                ),
            },
            {
                "role": "user",
                "content": f"Topic: {topic}\n\nResearch sections:\n{sections}",
            },
        ],
        temperature=0.5,
        max_tokens=2000,
    )
    return resp.choices[0].message.content.strip()


# ── Main pipeline entry point (SSE-friendly generator) ───────────────────────
async def run_pipeline(topic: str) -> AsyncGenerator[str, None]:
    def event(step: str, data: dict) -> str:
        return f"data: {json.dumps({'step': step, **data})}\n\n"

    yield event("start", {"message": f"Starting research on: {topic}"})

    # Step 1
    yield event("step1", {"message": "Decomposing topic into search queries..."})
    queries = await decompose_query(topic)
    yield event("step1_done", {"queries": queries})

    # Step 2
    yield event("step2", {"message": "Searching the web..."})
    search_data = await search_web(queries)
    yield event("step2_done", {"message": f"Found results for {len(queries)} queries"})

    # Step 3
    yield event("step3", {"message": "Synthesizing search results..."})
    syntheses = await synthesize_results(search_data)
    sources = [s for item in syntheses for s in item["sources"]]
    yield event("step3_done", {"syntheses": [s["synthesis"] for s in syntheses]})

    # Step 4
    yield event("step4", {"message": "Generating final report..."})
    report = await generate_report(topic, syntheses)
    yield event("complete", {"report": report, "sources": sources})
