import ast
import functools
import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import frontmatter

from .models import Publication, BlogPost, PortfolioProject, HomeData

logger = logging.getLogger(__name__)
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
            # Handle lists like ["A", "B"] or ['A', 'B']. ast.literal_eval
            # handles both quote styles natively and won't corrupt apostrophes
            # inside strings the way val.replace("'", '"') does.
            if val.startswith('[') and val.endswith(']'):
                try:
                    val = ast.literal_eval(val)
                except (ValueError, SyntaxError):
                    pass
            metadata[key] = val

    metadata["content"] = body_text
    return metadata

# Cached at module level — content is loaded once per process. lru_cache
# returns the same list reference on repeat calls; safe because callers
# don't mutate.
@functools.lru_cache(maxsize=1)
def load_publications() -> List[Publication]:
    with open(CONTENT_DIR / "publications.json", "r") as f:
        data = json.load(f)
    return [Publication(**item) for item in data]

@functools.lru_cache(maxsize=1)
def load_blog_posts() -> List[BlogPost]:
    blog_dir = CONTENT_DIR / "blog"
    posts = []
    # Path.glob("*.md") only yields files (not directories ending in .md),
    # avoiding the pitfall of os.listdir + suffix check.
    for path in blog_dir.glob("*.md"):
        try:
            with open(path, "r") as f:
                content = f.read()
                try:
                    post = frontmatter.loads(content)
                    metadata = post.metadata
                    metadata["content"] = post.content
                except Exception:
                    metadata = parse_md_defensive(content)

                d = metadata.get("date")
                if isinstance(d, str):
                    try:
                        d = datetime.strptime(d, "%Y-%m-%d").date()
                    except ValueError:
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
        except Exception as exc:
            logger.exception("Failed to load blog post %s: %s", path.name, exc)
    return posts

@functools.lru_cache(maxsize=1)
def load_portfolio() -> List[PortfolioProject]:
    portfolio_dir = CONTENT_DIR / "portfolio"
    projects = []
    for path in portfolio_dir.glob("*.md"):
        try:
            with open(path, "r") as f:
                content = f.read()
                try:
                    project = frontmatter.loads(content)
                    metadata = project.metadata
                    metadata["content"] = project.content
                except Exception:
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
        except Exception as exc:
            logger.exception("Failed to load portfolio project %s: %s", path.name, exc)
    return projects

@functools.lru_cache(maxsize=1)
def load_home_data() -> HomeData:
    with open(CONTENT_DIR / "home.json", "r") as f:
        data = json.load(f)
    return HomeData(**data)
