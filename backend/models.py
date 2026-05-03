from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date

class Publication(BaseModel):
    title: str
    journal: str
    year: str
    link: str
    type: Optional[str] = None
    preprint: Optional[str] = None

class BlogPost(BaseModel):
    title: str
    date: date
    slug: str
    oldUrl: Optional[str] = None
    categories: List[str] = []
    tags: List[str] = []
    image: Optional[str] = None
    content: str

class PortfolioProject(BaseModel):
    title: str
    subtitle: Optional[str] = None
    slug: str
    order: int
    skills: List[str] = []
    link: Optional[str] = None
    cta: Optional[str] = None
    image: Optional[str] = None
    content: str

class Experience(BaseModel):
    company: str
    role: str
    period: str
    highlights: List[str]

class Education(BaseModel):
    degree: str
    school: str
    year: str

class Press(BaseModel):
    title: str
    source: str
    date: str
    url: str

class HomeData(BaseModel):
    hero: Dict[str, str]
    social: Dict[str, str]
    experience: List[Experience]
    education: List[Education]
    awards: List[str]
    skills: Dict[str, List[str]]
    about: str
    bio: List[str]
    interests: List[str]
    press: List[Press]

# Tool Output Models
class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    type: str  # "blog" or "publication"
    date: Optional[str] = None

class ProjectResult(BaseModel):
    title: str
    subtitle: Optional[str] = None
    slug: str
    skills: List[str]
    url: str
