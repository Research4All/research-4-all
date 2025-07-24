from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from fastapi.responses import StreamingResponse
import httpx
import os
from datetime import datetime

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
    year: Optional[int] = Field(None, description="Publication year of the paper")
    
class User(BaseModel):
    interests: List[str] = Field(..., description="List of interests as strings")
    savedPapers: List[str] = Field(default=[], description="List of saved paper IDs")

class PaperRecommendationRequest(BaseModel):
    user_interests: List[str] = Field(..., description="List of user interests as strings")
    papers: List[Paper] = Field(..., description="List of papers with their fields of study")
    saved_papers: List[Paper] = Field(default=[], description="User's saved papers for content-based filtering")
    
class HybridRecommendationRequest(BaseModel):
    user_interests: List[str] = Field(..., description="List of user interests as strings")
    papers: List[Paper] = Field(..., description="List of papers with their fields of study")
    saved_papers: List[Paper] = Field(default=[], description="User's saved papers for content-based filtering")
    followers_saved_papers: List[Paper] = Field(default=[], description="Papers saved by user's followers")
    similar_users_saved_papers: List[Paper] = Field(default=[], description="Papers saved by similar users")
    
class UserRecommendationRequest(BaseModel):
    user_interests: List[str] = Field(..., description="List of user interests as strings")
    users: List[User] = Field(..., description="List of users with their interests and other metadata")
    
class RecommendationResponse(BaseModel):
    similarities: List[float] = Field(..., description="List of similarity scores for each paper")
    total_items: int = Field(..., description="Total number of items considered for recommendation")
    content_scores: Optional[List[float]] = Field(None, description="Content-based filtering scores")
    collaborative_scores: Optional[List[float]] = Field(None, description="Collaborative filtering scores")

@app.get("/")
async def root():
    return {"message": "Hello World"}

def calculate_recency_score(publication_year: Optional[int], max_boost: float = 0.15) -> float:
    """Calculate recency boost score based on publication year."""
    if not publication_year:
        return 0.0
    
    current_year = datetime.now().year
    years_old = current_year - publication_year
    if years_old < 0:
        return max_boost 
    else:
        return max(0, max_boost * (5 - years_old) * 0.2)

def calculate_content_based_scores(user_interests: List[str], papers: List[Paper], saved_papers: List[Paper] = None) -> List[float]:
    """Calculate content-based filtering scores using user interests and saved papers."""
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    
    user_profile_parts = []
    
    if user_interests:
        user_profile_parts.append(" ".join(user_interests))
    
    if saved_papers:
        for paper in saved_papers:
            paper_content = []
            if paper.fieldsOfStudy:
                paper_content.extend(paper.fieldsOfStudy)
            if paper.abstract:
                paper_content.append(paper.abstract)
            if paper.title:
                paper_content.append(paper.title)
            if paper_content:
                user_profile_parts.append(" ".join(paper_content))
    
    if not user_profile_parts:
        return [0.0] * len(papers)
    
    user_profile = " ".join(user_profile_parts)
    
    paper_contents = []
    for paper in papers:
        paper_content = []
        if paper.fieldsOfStudy:
            paper_content.extend(paper.fieldsOfStudy)
        if paper.abstract:
            paper_content.append(paper.abstract)
        if paper.title:
            paper_content.append(paper.title)
        paper_contents.append(" ".join(paper_content))
    
    all_text = [user_profile] + paper_contents
    tfidf_matrix = vectorizer.fit_transform(all_text)
    
    user_vector = tfidf_matrix[0:1]
    paper_vectors = tfidf_matrix[1:]

    similarities = cosine_similarity(user_vector, paper_vectors)[0]
    
    OPEN_ACCESS_BOOST = 0.2
    boosted_similarities = []
    for i, paper in enumerate(papers):
        base_similarity = similarities[i]
        
        if paper.openAccessPdf and paper.openAccessPdf.get("url"):
            base_similarity = min(base_similarity + OPEN_ACCESS_BOOST, 1.0)
        
        recency_boost = calculate_recency_score(paper.year)
        base_similarity = min(base_similarity + recency_boost, 1.0)
        
        boosted_similarities.append(base_similarity)
    
    return boosted_similarities

def calculate_collaborative_scores(papers: List[Paper], followers_papers: List[Paper], similar_users_papers: List[Paper]) -> List[float]:
    """Calculate collaborative filtering scores based on followers and similar users."""
    if not papers:
        return []
    
    paper_scores = {}
    
    for paper in papers:
        paper_id = paper.paperId
        score = 0.0
        
        # Check followers' papers
        for follower_paper in followers_papers:
            if follower_paper.paperId == paper_id:
                score += 1.0
        
        # Check similar users' papers (weighted slightly less)
        for similar_user_paper in similar_users_papers:
            if similar_user_paper.paperId == paper_id:
                score += 0.7
        
        paper_scores[paper_id] = score
    
    max_score = max(paper_scores.values()) if paper_scores.values() else 1.0
    if max_score > 0:
        normalized_scores = [paper_scores.get(paper.paperId, 0.0) / max_score for paper in papers]
    else:
        normalized_scores = [0.0] * len(papers)
    
    return normalized_scores

@app.post("/recommend-papers", response_model=RecommendationResponse)
async def recommend_papers(request: PaperRecommendationRequest):
    """Original content-based recommendation using only user interests. Only used as fallback."""
    content_scores = calculate_content_based_scores(
        request.user_interests, 
        request.papers, 
        request.saved_papers
    )
    
    return RecommendationResponse(
        similarities=content_scores,
        total_items=len(request.papers),
        content_scores=content_scores
    )

@app.post("/hybrid-recommend-papers", response_model=RecommendationResponse)
async def hybrid_recommend_papers(request: HybridRecommendationRequest):
    """Hybrid recommendation combining content-based and collaborative filtering."""
    
    content_scores = calculate_content_based_scores(
        request.user_interests, 
        request.papers, 
        request.saved_papers
    )
    
    collaborative_scores = calculate_collaborative_scores(
        request.papers,
        request.followers_saved_papers,
        request.similar_users_saved_papers
    )
    
    content_weight = 0.7
    collaborative_weight = 0.3
    
    has_saved_papers = len(request.saved_papers) > 0
    has_followers_data = len(request.followers_saved_papers) > 0
    has_similar_users_data = len(request.similar_users_saved_papers) > 0
    
    # Weights are somewhat arbitrary, but aim to balance content and collaborative scores based on available data
    # users with saved papers and followers or similar users get a balanced hybrid score
    if has_saved_papers and (has_followers_data or has_similar_users_data):
        content_weight = 0.6
        collaborative_weight = 0.4
    # users with saved papers only get a higher content weight
    elif has_saved_papers:
        content_weight = 0.8
        collaborative_weight = 0.2
    # users with followers or similar users data get a higher collaborative weight
    elif has_followers_data or has_similar_users_data:
        content_weight = 0.3
        collaborative_weight = 0.7
    # users without saved papers or followers data get a balanced score
    else:
        content_weight = 1.0
        collaborative_weight = 0.0
    
    hybrid_scores = []
    for i in range(len(request.papers)):
        content_score = content_scores[i] if i < len(content_scores) else 0.0
        collaborative_score = collaborative_scores[i] if i < len(collaborative_scores) else 0.0
        
        hybrid_score = (content_score * content_weight) + (collaborative_score * collaborative_weight)
        hybrid_scores.append(hybrid_score)
    
    return RecommendationResponse(
        similarities=hybrid_scores,
        total_items=len(request.papers),
        content_scores=content_scores,
        collaborative_scores=collaborative_scores
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
    """Needed to avoid CORS issues when fetching PDFs from semantic scholar API for rendering in the frontend."""
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