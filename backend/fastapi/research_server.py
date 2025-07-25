import arxiv
import json
import os
from typing import List
from mcp.server.fastmcp import FastMCP
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Initialize FastMCP server
mcp = FastMCP("research")

# MongoDB connection
def get_mongo_client():
    """Get MongoDB client connection"""
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise ValueError("MONGO_URI environment variable not set")
    return MongoClient(mongo_uri)

def get_papers_collection():
    """Get the papers collection from MongoDB"""
    client = get_mongo_client()
    db = client.get_default_database()
    return db.papers

@mcp.tool()
def search_papers(topic: str, max_results: int = 5) -> List[str]:
    """
    Search for papers on arXiv based on a topic and store their information in the database.
    
    Args:
        topic: The topic to search for
        max_results: Maximum number of results to retrieve (default: 5)
        
    Returns:
        List of paper IDs found in the search
    """
    
    # Use arxiv to find the papers 
    client = arxiv.Client()

    # Search for the most relevant articles matching the queried topic
    search = arxiv.Search(
        query = topic,
        max_results = max_results,
        sort_by = arxiv.SortCriterion.Relevance
    )

    papers = client.results(search)
    papers_collection = get_papers_collection()
    
    # Process each paper and add to database
    paper_ids = []
    for paper in papers:
        paper_id = paper.get_short_id()
        paper_ids.append(paper_id)
        
        # Check if paper already exists in database
        existing_paper = papers_collection.find_one({"paperId": paper_id})
        if existing_paper:
            print(f"Paper {paper_id} already exists in database")
            continue
            
        paper_info = {
            'paperId': paper_id,
            'title': paper.title,
            'abstract': paper.summary,
            'url': paper.pdf_url,
            'openAccessPdf': {
                'url': paper.pdf_url,
                'license': 'unknown',
                'status': 'available'
            },
            'fieldsOfStudy': [topic],
            'publicationDate': str(paper.published.date()),
            'publicationTypes': ['arxiv'],
            'authors': [author.name for author in paper.authors],
            'annotations': [],
            'highlights': []
        }
        
        # Insert paper into database
        papers_collection.insert_one(paper_info)
        print(f"Added paper {paper_id} to database")
    
    print(f"Found {len(paper_ids)} papers for topic: {topic}")
    return paper_ids

@mcp.tool()
def extract_info(paper_id: str) -> str:
    """
    Search for information about a specific paper in the database.
    
    Args:
        paper_id: The ID of the paper to look for
        
    Returns:
        JSON string with paper information if found, error message if not found
    """
    papers_collection = get_papers_collection()
    
    paper = papers_collection.find_one({"paperId": paper_id})
    if paper:
        # Convert ObjectId to string for JSON serialization
        paper['_id'] = str(paper['_id'])
        return json.dumps(paper, indent=2, default=str)
    else:
        return f"There's no saved information related to paper {paper_id}."

@mcp.tool()
def get_papers_by_topic(topic: str, limit: int = 10) -> List[str]:
    """
    Get papers from the database that match a specific topic.
    
    Args:
        topic: The topic to search for in fieldsOfStudy
        limit: Maximum number of papers to return
        
    Returns:
        List of paper IDs matching the topic
    """
    papers_collection = get_papers_collection()
    
    # Search for papers with the topic in fieldsOfStudy
    papers = papers_collection.find(
        {"fieldsOfStudy": {"$regex": topic, "$options": "i"}},
        {"paperId": 1}
    ).limit(limit)
    
    paper_ids = [paper['paperId'] for paper in papers]
    return paper_ids

@mcp.resource("papers://folders")
def get_available_folders() -> str:
    """
    List all available topics in the database.
    
    This resource provides a list of all unique topics from saved papers.
    """
    papers_collection = get_papers_collection()
    
    # Get all unique fields of study
    topics = papers_collection.distinct("fieldsOfStudy")
    # Flatten the list since fieldsOfStudy is an array
    all_topics = []
    for topic_list in topics:
        all_topics.extend(topic_list)
    unique_topics = list(set(all_topics))
    
    # Create a simple markdown list
    content = "# Available Topics\n\n"
    if unique_topics:
        for topic in sorted(unique_topics):
            content += f"- {topic}\n"
        content += f"\nUse @{unique_topics[0] if unique_topics else 'topic'} to access papers in that topic.\n"
    else:
        content += "No topics found. Try searching for papers first.\n"
    
    return content

@mcp.resource("papers://{topic}")
def get_topic_papers(topic: str) -> str:
    """
    Get detailed information about papers on a specific topic from the database.
    
    Args:
        topic: The research topic to retrieve papers for
    """
    papers_collection = get_papers_collection()
    
    # Search for papers with the topic in fieldsOfStudy
    papers = papers_collection.find(
        {"fieldsOfStudy": {"$regex": topic, "$options": "i"}}
    ).limit(20)  # Limit to prevent overwhelming output
    
    papers_list = list(papers)
    
    if not papers_list:
        return f"# No papers found for topic: {topic}\n\nTry searching for papers on this topic first using the search_papers tool."
    
    # Create markdown content with paper details
    content = f"# Papers on {topic.title()}\n\n"
    content += f"Total papers: {len(papers_list)}\n\n"
    
    for paper in papers_list:
        content += f"## {paper.get('title', 'No title')}\n"
        content += f"- **Paper ID**: {paper.get('paperId', 'No ID')}\n"
        content += f"- **Authors**: {', '.join(paper.get('authors', []))}\n"
        content += f"- **Published**: {paper.get('publicationDate', 'Unknown')}\n"
        if paper.get('url'):
            content += f"- **URL**: [{paper['url']}]({paper['url']})\n"
        content += f"- **Topics**: {', '.join(paper.get('fieldsOfStudy', []))}\n\n"
        
        abstract = paper.get('abstract', '')
        if abstract:
            content += f"### Abstract\n{abstract[:500]}...\n\n"
        
        content += "---\n\n"
    
    return content

@mcp.prompt()
def generate_search_prompt(topic: str, num_papers: int = 5) -> str:
    """Generate a prompt for Claude to find and discuss academic papers on a specific topic."""
    return f"""Search for {num_papers} academic papers about '{topic}' using the search_papers tool. 

Follow these instructions:
1. First, search for papers using search_papers(topic='{topic}', max_results={num_papers})
2. For each paper found, extract and organize the following information:
   - Paper title
   - Authors
   - Publication date
   - Brief summary of the key findings
   - Main contributions or innovations
   - Methodologies used
   - Relevance to the topic '{topic}'

3. Provide a comprehensive summary that includes:
   - Overview of the current state of research in '{topic}'
   - Common themes and trends across the papers
   - Key research gaps or areas for future investigation
   - Most impactful or influential papers in this area

4. Organize your findings in a clear, structured format with headings and bullet points for easy readability.

Please present both detailed information about each paper and a high-level synthesis of the research landscape in {topic}."""

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')