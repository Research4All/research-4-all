from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from fastapi.responses import StreamingResponse
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"), 
        os.getenv("BACKEND_URL", "http://localhost:3000")], 
    allow_credentials=True,
    allow_methods=["GET", "POST"], 
    allow_headers=["Content-Type", "Authorization"],
)

class Paper(BaseModel):
    paperId: str = Field(..., description="Paper ID from the semantic scholar API")
    title: str = Field(..., description="Title of the paper")
    fieldsOfStudy: List[str] = Field(..., description="List of fields of study related to the paper")
    abstract: Optional[str] = Field(None, description="Abstract of the paper")
    url: Optional[str] = Field(None, description="URL to the paper")
    openAccessPdf: Optional[Dict[str, Any]] = Field(None, description="Open access PDF information")
    
class User(BaseModel):
    interests: List[str] = Field(..., description="List of interests as strings")

class PaperRecommendationRequest(BaseModel):
    user_interests: List[str] = Field(..., description="List of user interests as strings")
    papers: List[Paper] = Field(..., description="List of papers with their fields of study")
    
class UserRecommendationRequest(BaseModel):
    user_interests: List[str] = Field(..., description="List of user interests as strings")
    users: List[User] = Field(..., description="List of users with their interests and other metadata")
    
class RecommendationResponse(BaseModel):
    similarities: List[float] = Field(..., description="List of similarity scores for each paper")
    total_items: int = Field(..., description="Total number of items considered for recommendation")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/recommend-papers", response_model=RecommendationResponse)
async def recommend_papers(request: PaperRecommendationRequest):
    vectorizer = TfidfVectorizer()

    user_profile = " ".join(request.user_interests)

    paper_fields = []
    OPEN_ACCESS_BOOST = 0.3 # Prefer open access papers

    if not request.papers:
        return RecommendationResponse(
            similarities=[],
            total_items=0
        )
        
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

    # TODO: cache similarity results 
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
        total_items=len(request.papers)
    )
    
@app.post("/recommend-users", response_model=RecommendationResponse)
async def recommend_users(request: UserRecommendationRequest):
    vectorizer = TfidfVectorizer()
    
    user_profile = " ".join(request.user_interests)
    
    mentor_interests = []
    
    for user in request.users:
        if user.interests:
            interest_text = ' '.join(user.interests)
        else: 
            interest_text = ""
        mentor_interests.append(interest_text)
            
    all_interests = [user_profile] + mentor_interests
    tfidf_matrix = vectorizer.fit_transform(all_interests)
    
    user_vector = tfidf_matrix[0:1]
    mentor_vectors = tfidf_matrix[1:]
    
    similarities = cosine_similarity(user_vector, mentor_vectors)
    
    return RecommendationResponse(
        similarities=similarities[0].tolist(),
        total_items=len(request.users)
    )
    
@app.get("/proxy-pdf")
async def proxy_pdf(url: str):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(url)
        if response.status_code == 200:
            headers = {
                "Content-Disposition": f"inline; filename=proxy.pdf",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/pdf"
            }
            return StreamingResponse(response.iter_bytes(), headers=headers, media_type="application/pdf")
        else:
            return {"error": "Failed to fetch PDF", "status_code": response.status_code}