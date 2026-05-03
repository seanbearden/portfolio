import os
import json
import frontmatter
import re
from typing import List, Dict, Any
from .models import Publication, BlogPost, PortfolioProject, HomeData
from pathlib import Path
from datetime import datetime, date

CONTENT_DIR = Path("content")

def parse_md_defensive(content: str) -> Dict[str, Any]:
    """Manually parse frontmatter to handle unescaped quotes and JSON-like lists."""
    fm_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not fm_match:
        return {"content": content}

    fm_text = fm_match.group(1)
    body_text = fm_match.group(2)

    metadata = {}
    for line in fm_text.split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()
            # Handle quoted strings
            if val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            # Handle lists like ["A", "B"]
            if val.startswith('[') and val.endswith(']'):
                try:
                    val = json.loads(val.replace("'", '"'))
                except:
                    pass
            metadata[key] = val

    metadata["content"] = body_text
    return metadata

def load_publications() -> List[Publication]:
    with open(CONTENT_DIR / "publications.json", "r") as f:
        data = json.load(f)
    return [Publication(**item) for item in data]

def load_blog_posts() -> List[BlogPost]:
    blog_dir = CONTENT_DIR / "blog"
    posts = []
    for file in os.listdir(blog_dir):
        if file.endswith(".md"):
            try:
                with open(blog_dir / file, "r") as f:
                    content = f.read()
                    try:
                        post = frontmatter.loads(content)
                        metadata = post.metadata
                        metadata["content"] = post.content
                    except:
                        metadata = parse_md_defensive(content)

                    d = metadata.get("date")
                    if isinstance(d, str):
                        try:
                            d = datetime.strptime(d, "%Y-%m-%d").date()
                        except:
                            pass

                    posts.append(BlogPost(
                        title=metadata.get("title", ""),
                        date=d,
                        slug=metadata.get("slug", ""),
                        oldUrl=metadata.get("oldUrl"),
                        categories=metadata.get("categories", []),
                        tags=metadata.get("tags", []),
                        image=metadata.get("image"),
                        content=metadata.get("content", "")
                    ))
            except Exception as e:
                print(f"Error loading blog post {file}: {e}")
    return posts

def load_portfolio() -> List[PortfolioProject]:
    portfolio_dir = CONTENT_DIR / "portfolio"
    projects = []
    for file in os.listdir(portfolio_dir):
        if file.endswith(".md"):
            try:
                with open(portfolio_dir / file, "r") as f:
                    content = f.read()
                    try:
                        project = frontmatter.loads(content)
                        metadata = project.metadata
                        metadata["content"] = project.content
                    except:
                        metadata = parse_md_defensive(content)

                    projects.append(PortfolioProject(
                        title=metadata.get("title", ""),
                        subtitle=metadata.get("subtitle"),
                        slug=metadata.get("slug", ""),
                        order=int(metadata.get("order", 0)),
                        skills=metadata.get("skills", []),
                        link=metadata.get("link"),
                        cta=metadata.get("cta"),
                        image=metadata.get("image"),
                        content=metadata.get("content", "")
                    ))
            except Exception as e:
                print(f"Error loading project {file}: {e}")
    return projects

def load_home_data() -> HomeData:
    with open(CONTENT_DIR / "home.json", "r") as f:
        data = json.load(f)
    return HomeData(**data)
