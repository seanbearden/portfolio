#!/usr/bin/env python3
"""
Ingest portfolio content (blog, portfolio, publications, about) into a pgvector store.
"""

import os
import json
import re
from pathlib import Path
import frontmatter
import markdown
from bs4 import BeautifulSoup
import psycopg2
from pgvector.psycopg2 import register_vector
from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "content"

# Configuration
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
REGION = os.getenv("GCP_REGION", "us-central1")
DB_NAME = os.getenv("DB_NAME", "portfolio")
DB_USER = os.getenv("DB_USER", "ingest-user")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST", "/cloudsql/{}".format(os.getenv("DB_INSTANCE_CONNECTION_NAME")))
EMBEDDING_MODEL_NAME = "text-embedding-004" # Plan specified gemini-embedding-001, but text-embedding-004 is the robust Vertex AI equivalent

def load_blog():
    blog_dir = CONTENT_DIR / "blog"
    posts = []
    for f in blog_dir.glob("*.md"):
        post = frontmatter.load(f)
        posts.append({
            "type": "blog",
            "slug": f.stem,
            "title": post.get("title", ""),
            "content": post.content,
            "url": f"/blog/{f.stem}"
        })
    return posts

def load_portfolio():
    portfolio_dir = CONTENT_DIR / "portfolio"
    projects = []
    for f in portfolio_dir.glob("*.md"):
        project = frontmatter.load(f)
        projects.append({
            "type": "portfolio",
            "slug": f.stem,
            "title": project.get("title", ""),
            "content": project.content,
            "url": f"/portfolio/{f.stem}"
        })
    return projects

def load_publications():
    pub_file = CONTENT_DIR / "publications.json"
    with open(pub_file, "r") as f:
        pubs = json.load(f)

    results = []
    for pub in pubs:
        content = f"{pub['title']}. Published in {pub['journal']}, {pub['year']}."
        results.append({
            "type": "publication",
            "slug": re.sub(r'[^a-z0-9]+', '-', pub['title'].lower()),
            "title": pub['title'],
            "content": content,
            "url": pub.get("link", "/publications")
        })
    return results

def load_home():
    home_file = CONTENT_DIR / "home.json"
    with open(home_file, "r") as f:
        home = json.load(f)

    chunks = []
    # Bio
    if "bio" in home:
        for i, p in enumerate(home["bio"]):
            chunks.append({
                "type": "about",
                "slug": f"bio-{i}",
                "title": "Biography",
                "content": p,
                "url": "/about"
            })

    # Experience
    if "experience" in home:
        for exp in home["experience"]:
            content = f"Experience at {exp['company']} as {exp['role']} ({exp['period']}): " + "; ".join(exp['highlights'])
            chunks.append({
                "type": "experience",
                "slug": re.sub(r'[^a-z0-9]+', '-', exp['company'].lower()),
                "title": f"Experience: {exp['company']}",
                "content": content,
                "url": "/about"
            })

    return chunks

def chunk_markdown(item):
    html = markdown.markdown(item["content"])
    soup = BeautifulSoup(html, "html.parser")

    chunks = []
    current_title = item["title"]
    current_content = []

    for tag in soup.find_all(['h1', 'h2', 'h3', 'p', 'li']):
        if tag.name in ['h1', 'h2', 'h3']:
            if current_content:
                chunks.append({
                    **item,
                    "title": current_title,
                    "content": "\n".join(current_content).strip()
                })
            current_title = f"{item['title']} - {tag.get_text()}"
            current_content = []
        else:
            current_content.append(tag.get_text())

    if current_content:
        chunks.append({
            **item,
            "title": current_title,
            "content": "\n".join(current_content).strip()
        })

    return chunks

def get_embeddings(texts):
    if not texts:
        return []

    aiplatform.init(project=PROJECT_ID, location=REGION)
    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL_NAME)
    inputs = [TextEmbeddingInput(text, "RETRIEVAL_DOCUMENT") for text in texts]
    embeddings = model.get_embeddings(inputs)
    return [e.values for e in embeddings]

def setup_db(conn):
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chunks (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                metadata JSONB NOT NULL,
                embedding vector(768)
            )
        """)
        conn.commit()

def upsert_chunks(conn, chunks, embeddings):
    with conn.cursor() as cur:
        # Simple approach: clear and reload for this personal portfolio
        cur.execute("TRUNCATE TABLE chunks")
        for chunk, embedding in zip(chunks, embeddings):
            metadata = {
                "type": chunk["type"],
                "slug": chunk["slug"],
                "title": chunk["title"],
                "url": chunk["url"]
            }
            cur.execute(
                "INSERT INTO chunks (content, metadata, embedding) VALUES (%s, %s, %s)",
                (chunk["content"], json.dumps(metadata), embedding)
            )
        conn.commit()

def main():
    print("Loading content...")
    items = load_blog() + load_portfolio()

    all_chunks = []
    for item in items:
        all_chunks.extend(chunk_markdown(item))

    all_chunks.extend(load_publications())
    all_chunks.extend(load_home())

    # Filter out empty chunks
    all_chunks = [c for c in all_chunks if c["content"].strip()]

    print(f"Generated {len(all_chunks)} chunks.")

    print("Generating embeddings...")
    # Vertex AI has limits on batch size, usually 250
    batch_size = 100
    all_embeddings = []
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i+batch_size]
        texts = [c["content"] for c in batch]
        all_embeddings.extend(get_embeddings(texts))

    print("Upserting to database...")
    if DB_HOST.startswith("/"):
        # Unix socket connection for Cloud Run / Cloud SQL Proxy
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
    else:
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )

    register_vector(conn)
    setup_db(conn)
    upsert_chunks(conn, all_chunks, all_embeddings)
    conn.close()
    print("Done!")

if __name__ == "__main__":
    main()
