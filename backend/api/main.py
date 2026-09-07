from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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


