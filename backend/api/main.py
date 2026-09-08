from dotenv import load_dotenv
load_dotenv()

import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Annotated

from pipeline.pipeline import AnimeRecommenderPipeline
app = FastAPI(
    title="Anime Recommender API",
    description="AI-Powered Anime Recommender API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    query: Annotated[str,Field(...,description="Query string",examples=["Suggest Anime like Naruto"])]

class RecommendationResponse(BaseModel):
    query: str
    recommendations: str


pipeline = AnimeRecommenderPipeline()


@app.get("/")
def root():
    return {
        "message": "Anime Recommender API is running"
    }

app.get("/health")
def health():
    return {"status": "ok"}


@app.post(
    "/api/recommendations",
    response_model=RecommendationResponse,
)
def recommendations(request: RecommendationRequest):

    try:
        result = pipeline.recommend(request.query)
        return {
            "query": request.query,
            "recommendations": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommendations/stream")
def recommendations_stream(request: RecommendationRequest):
    def event_generator():
        try:
            for chunk_text in pipeline.recommend_stream(request.query):
                if chunk_text:
                    event_data = json.dumps({"type": "chunk", "content": chunk_text})
                    yield f"data: {event_data}\n\n"
            done_data = json.dumps({"type": "done"})
            yield f"data: {done_data}\n\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "message": "Unable to generate recommendations"})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )




