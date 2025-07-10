from fastapi import FastAPI
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

app = FastAPI()

class Paper(BaseModel):
    paperId: str = Field(..., description="Paper ID from the semantic scholar API")
    title: str = Field(..., description="Title of the paper")
    fieldsOfStudy: List[str] = Field(..., description="List of fields of study related to the paper")
    abstract: Optional[str] = Field(None, description="Abstract of the paper")
    url: Optional[str] = Field(None, description="URL to the paper")
    openAccessPdf: Optional[Dict[str, Any]] = Field(None, description="Open access PDF information")

class RecommendationRequest(BaseModel):
    user_interests: List[str] = Field(..., description="List of user interests as strings")
    papers: List[Paper] = Field(..., description="List of papers with their fields of study")
    
class RecommendationResponse(BaseModel):
    similarities: List[float] = Field(..., description="List of similarity scores for each paper")
    total_papers: int = Field(..., description="Total number of papers considered for recommendation")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/recommend-papers", response_model=RecommendationResponse)
async def recommend_papers(request: RecommendationRequest):
    vectorizer = TfidfVectorizer()

    user_profile = " ".join(request.user_interests)

    paper_fields = []
    OPEN_ACCESS_BOOST = 0.1 # Prefer open access papers

    for paper in request.papers:
        if paper.fieldsOfStudy:
            field_text = ' '.join(paper.fieldsOfStudy)
        else:
            field_text = paper.title
        paper_fields.append(field_text)
            
    all_text = [user_profile] + paper_fields
    tfidf_matrix = vectorizer.fit_transform(all_text)
    
    user_vector = tfidf_matrix[0:1]
    paper_vectors = tfidf_matrix[1:]

    similarities = cosine_similarity(user_vector, paper_vectors)
    
    boosted_similarities = []
    for i, paper in enumerate(request.papers):
        base_similarity = similarities[0][i]
        
        if paper.openAccessPdf and paper.openAccessPdf.get("url"):
            boosted_similarity = base_similarity + OPEN_ACCESS_BOOST
            boosted_similarity = min(boosted_similarity, 1.0)
        else:
            boosted_similarity = base_similarity
            
        boosted_similarities.append(boosted_similarity)
    
    return RecommendationResponse(
        similarities=boosted_similarities,
        total_papers=len(request.papers)
    )