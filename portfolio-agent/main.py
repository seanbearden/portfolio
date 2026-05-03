import functools
import json
import os
from pathlib import Path
from typing import Dict, List, Optional

import frontmatter
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("Bearden Portfolio")

# Constants
CONTENT_DIR = Path(os.getenv("CONTENT_DIR", "../content"))

def load_json(filename: str):
    path = CONTENT_DIR / filename
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@functools.lru_cache(maxsize=8)
def load_markdown_files(directory: str) -> List[dict]:
    """Load and parse every .md in a content subdirectory. Cached for the
    process lifetime — content is bundled at image build time and doesn't
    change at runtime."""
    path = CONTENT_DIR / directory
    if not path.exists():
        return []

    files = []
    for file_path in path.glob("*.md"):
        post = frontmatter.load(file_path)
        data = post.metadata
        data["body"] = post.content
        data["slug"] = data.get("slug") or file_path.stem
        files.append(data)
    return files

@functools.lru_cache(maxsize=8)
def slug_index(directory: str) -> Dict[str, dict]:
    """slug → parsed-post map for O(1) lookup. Cached. Filenames don't
    always equal slugs (e.g., `03-understanding-...md` has frontmatter
    slug `understanding-my-phd-research-...`), so this index is built
    from frontmatter, not from the filename."""
    return {entry["slug"]: entry for entry in load_markdown_files(directory)}

@mcp.tool(name="bearden_portfolio.get_about")
def get_about() -> str:
    """Get information about Sean Bearden's background and bio."""
    data = load_json("home.json")
    if not data:
        return "About information not found."

    bio = "\n\n".join(data.get("bio", []))
    about = data.get("about", "")
    return f"{about}\n\n{bio}"

@mcp.tool(name="bearden_portfolio.get_resume")
def get_resume() -> str:
    """Get Sean Bearden's professional experience, education, and skills."""
    data = load_json("home.json")
    if not data:
        return "Resume information not found."

    experience = "Experience:\n"
    for exp in data.get("experience", []):
        experience += f"- {exp['role']} at {exp['company']} ({exp['period']})\n"
        for highlight in exp.get("highlights", []):
            experience += f"  * {highlight}\n"

    education = "\nEducation:\n"
    for edu in data.get("education", []):
        education += f"- {edu['degree']}, {edu['school']} ({edu['year']})\n"

    skills = "\nSkills:\n"
    for category, items in data.get("skills", {}).items():
        skills += f"- {category.capitalize()}: {', '.join(items)}\n"

    return f"{experience}{education}{skills}"

@mcp.tool(name="bearden_portfolio.list_projects")
def list_projects() -> str:
    """List portfolio projects with their titles and summaries."""
    projects = load_markdown_files("portfolio")
    if not projects:
        return "No projects found."

    # Sort by order if available
    projects.sort(key=lambda x: x.get("order", 999))

    output = "Portfolio Projects:\n"
    for p in projects:
        output += f"- {p['title']} (slug: {p['slug']})\n"
        if p.get("subtitle"):
            output += f"  {p['subtitle']}\n"
    return output

@mcp.tool(name="bearden_portfolio.search_blog")
def search_blog(query: Optional[str] = None) -> str:
    """Search blog posts by title or content. If no query is provided, lists recent posts."""
    posts = load_markdown_files("blog")
    if not posts:
        return "No blog posts found."

    # Sort by date descending
    posts.sort(key=lambda x: x.get("date", ""), reverse=True)

    if query:
        query = query.lower()
        filtered = [
            p for p in posts
            if query in p["title"].lower() or query in p["body"].lower()
        ]
    else:
        filtered = posts[:10] # Top 10 recent

    if not filtered:
        return f"No blog posts found matching: {query}"

    output = "Blog Posts:\n"
    for p in filtered:
        output += f"- {p['title']} ({p.get('date', 'No date')}, slug: {p['slug']})\n"
    return output

@mcp.tool(name="bearden_portfolio.search_publications")
def search_publications(query: Optional[str] = None) -> str:
    """Search academic publications by title or journal."""
    publications = load_json("publications.json")
    if not publications:
        return "No publications found."

    if query:
        query = query.lower()
        filtered = [
            p for p in publications
            if query in p["title"].lower() or query in p["journal"].lower()
        ]
    else:
        filtered = publications

    if not filtered:
        return f"No publications found matching: {query}"

    output = "Publications:\n"
    for p in filtered:
        output += f"- {p['title']}\n"
        output += f"  Journal: {p['journal']} ({p['year']})\n"
        output += f"  Link: {p['link']}\n"
    return output

@mcp.resource("mcp://blog/{slug}")
def get_blog_post(slug: str) -> str:
    """Retrieve the full content of a blog post by its slug. O(1) via cached
    slug index; the index is built from frontmatter, since filenames don't
    always match slugs."""
    p = slug_index("blog").get(slug)
    if not p:
        return f"Blog post with slug '{slug}' not found."
    return f"# {p['title']}\nDate: {p.get('date')}\n\n{p['body']}"

@mcp.resource("mcp://projects/{slug}")
def get_project(slug: str) -> str:
    """Retrieve the full content of a portfolio project by its slug. O(1) via
    cached slug index."""
    p = slug_index("portfolio").get(slug)
    if not p:
        return f"Project with slug '{slug}' not found."
    output = f"# {p['title']}\n"
    if p.get("subtitle"):
        output += f"## {p['subtitle']}\n"
    output += f"\n{p['body']}"
    return output

if __name__ == "__main__":
    # MCP server configuration for Cloud Run
    # Using SSE transport and a port defined by the environment variable
    port = int(os.getenv("PORT", 8081))
    mcp.run(transport="sse", port=port)
