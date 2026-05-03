from typing import List, Optional
from .vector_store import vector_store
from .loader import load_portfolio, load_home_data
from .models import SearchResult, ProjectResult, HomeData, Publication

# Base URL for assets (to be used in resume/cv/pdf tools)
ASSETS_BASE_URL = "https://storage.googleapis.com/seanbearden-assets"

def search_publications(query: str, limit: int = 5, year: Optional[int] = None) -> List[SearchResult]:
    """Search Sean's academic publications by title or journal. Can filter by year."""
    return vector_store.search_publications(query, limit, year)

def search_blog(query: str, limit: int = 5, year: Optional[int] = None) -> List[SearchResult]:
    """Search Sean's blog posts by content or title. Can filter by year."""
    return vector_store.search_blog(query, limit, year)

def list_projects(skill_filter: Optional[str] = None) -> List[ProjectResult]:
    """List portfolio projects, optionally filtered by a specific skill (e.g., 'Python', 'LLM')."""
    projects = load_portfolio()
    results = []
    for p in projects:
        if skill_filter and skill_filter.lower() not in [s.lower() for s in p.skills]:
            continue
        results.append(ProjectResult(
            title=p.title,
            subtitle=p.subtitle,
            slug=p.slug,
            skills=p.skills,
            url=f"https://seanbearden.com/portfolio/{p.slug}"
        ))
    return sorted(results, key=lambda x: x.title)

def get_about() -> HomeData:
    """Get Sean's general background, experience, education, skills, and bio."""
    return load_home_data()

def get_resume() -> str:
    """Return the URL to Sean's latest resume PDF."""
    return f"{ASSETS_BASE_URL}/pdfs/Bearden_Resume_Online.pdf"

def get_cv() -> str:
    """Return the URL to Sean's latest curriculum vitae (CV) PDF."""
    return f"{ASSETS_BASE_URL}/pdfs/Bearden_CV.pdf"

def get_publication_pdf(slug: str) -> Optional[str]:
    """Return the preprint PDF URL for a specific publication if available."""
    # This is a bit of a stretch as we don't have slugs for publications in JSON
    # but we can try to match by partial title or use the preprint field if the user identifies it.
    pubs = vector_store.publications
    for pub in pubs:
        # Simple slug-like matching for now
        if slug.replace("-", " ").lower() in pub.title.lower():
            return pub.preprint if pub.preprint else "Preprint not available, see main link: " + pub.link
    return "Publication not found."
