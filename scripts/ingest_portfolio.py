import json
import os
import re
from pathlib import Path
import frontmatter
from langchain_text_splitters import MarkdownHeaderTextSplitter

ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "content"

def chunk_markdown(file_path, content_type):
    """Parse MD file and split by headers."""
    with open(file_path, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]

    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    chunks = markdown_splitter.split_text(post.content)

    results = []
    for i, chunk in enumerate(chunks):
        # Combine headers into a single title for context if needed
        header_context = " > ".join([v for k, v in chunk.metadata.items() if k.startswith("Header")])
        title = post.get('title', file_path.stem)
        if header_context:
            chunk_title = f"{title}: {header_context}"
        else:
            chunk_title = title

        results.append({
            "content": chunk.page_content,
            "metadata": {
                "source": str(file_path.relative_to(ROOT)),
                "title": chunk_title,
                "slug": post.get('slug', slugify(title)),
                "type": content_type,
                "chunk_index": i
            }
        })
    return results

def slugify(title):
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug

def process_publications():
    """Each publication is its own chunk."""
    pub_file = CONTENT_DIR / "publications.json"
    if not pub_file.exists():
        return []

    with open(pub_file, 'r', encoding='utf-8') as f:
        pubs = json.load(f)

    results = []
    for i, pub in enumerate(pubs):
        content = f"Title: {pub['title']}\nJournal: {pub.get('journal', 'N/A')}\nYear: {pub.get('year', 'N/A')}"
        if pub.get('type'):
            content += f"\nType: {pub['type']}"

        results.append({
            "content": content,
            "metadata": {
                "source": "content/publications.json",
                "title": pub['title'],
                "slug": slugify(pub['title']),
                "type": "publication",
                "chunk_index": i
            }
        })
    return results

def process_home():
    """Split home.json into Bio, Experience, Education, Awards, Skills chunks."""
    home_file = CONTENT_DIR / "home.json"
    if not home_file.exists():
        return []

    with open(home_file, 'r', encoding='utf-8') as f:
        home = json.load(f)

    results = []

    # Bio
    bio_content = ""
    if isinstance(home.get('bio'), list):
        bio_content = "\n\n".join(home['bio'])
    else:
        bio_content = home.get('bio', '')

    if bio_content:
        results.append({
            "content": bio_content,
            "metadata": {
                "source": "content/home.json",
                "title": "Sean Bearden - Bio",
                "slug": "about-bio",
                "type": "bio",
                "chunk_index": 0
            }
        })

    # Experience
    for i, exp in enumerate(home.get('experience', [])):
        content = f"Company: {exp['company']}\nRole: {exp['role']}\nPeriod: {exp['period']}\nHighlights:\n- " + "\n- ".join(exp['highlights'])
        results.append({
            "content": content,
            "metadata": {
                "source": "content/home.json",
                "title": f"Experience: {exp['company']}",
                "slug": f"exp-{slugify(exp['company'])}",
                "type": "experience",
                "chunk_index": i
            }
        })

    # Education
    for i, edu in enumerate(home.get('education', [])):
        content = f"Degree: {edu['degree']}\nSchool: {edu['school']}\nYear: {edu['year']}"
        results.append({
            "content": content,
            "metadata": {
                "source": "content/home.json",
                "title": f"Education: {edu['degree']}",
                "slug": f"edu-{slugify(edu['degree'])}",
                "type": "education",
                "chunk_index": i
            }
        })

    # Skills
    skills = home.get('skills', {})
    skills_content = "Technical Skills:\n"
    for category, items in skills.items():
        skills_content += f"- {category.capitalize()}: {', '.join(items)}\n"

    results.append({
        "content": skills_content.strip(),
        "metadata": {
            "source": "content/home.json",
            "title": "Technical Skills",
            "slug": "skills",
            "type": "skills",
            "chunk_index": 0
        }
    })

    return results

def get_all_chunks():
    all_chunks = []

    # Blog
    blog_dir = CONTENT_DIR / "blog"
    if blog_dir.exists():
        for md_file in blog_dir.glob("*.md"):
            all_chunks.extend(chunk_markdown(md_file, "blog"))

    # Portfolio
    portfolio_dir = CONTENT_DIR / "portfolio"
    if portfolio_dir.exists():
        for md_file in portfolio_dir.glob("*.md"):
            all_chunks.extend(chunk_markdown(md_file, "portfolio"))

    # Publications
    all_chunks.extend(process_publications())

    # Home
    all_chunks.extend(process_home())

    return all_chunks

import time
from google.cloud import aiplatform
from google.cloud.sql.connector import Connector
import psycopg2
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

# Configuration
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
REGION = os.environ.get("GCP_REGION", "us-central1")
INSTANCE_NAME = os.environ.get("GCP_SQL_INSTANCE", "portfolio-db")
DB_NAME = "portfolio_vector"
DB_USER = os.environ.get("GCP_SQL_USER") # Should be the SA email without .gserviceaccount.com

def get_embeddings(texts):
    """Generate embeddings using gemini-embedding-001."""
    aiplatform.init(project=PROJECT_ID, location=REGION)
    model = TextEmbeddingModel.from_pretrained("gemini-embedding-001")

    # Vertex AI embedding limit is 250 inputs per request
    batch_size = 100
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_DOCUMENT") for text in batch]
        embeddings = model.get_embeddings(inputs)
        all_embeddings.extend([e.values for e in embeddings])

    return all_embeddings

def init_db(conn):
    """Initialize the database with pgvector and table."""
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS portfolio_chunks (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                metadata JSONB NOT NULL,
                embedding vector(768)
            )
        """)
        # Create index for faster search
        cur.execute("CREATE INDEX IF NOT EXISTS portfolio_chunks_embedding_idx ON portfolio_chunks USING hnsw (embedding vector_cosine_ops)")
        conn.commit()

def upsert_chunks(conn, chunks, embeddings):
    """Insert or update chunks in the database."""
    with conn.cursor() as cur:
        # For simplicity, we clear and re-index.
        # For a small site this is fine and ensures consistency.
        cur.execute("DELETE FROM portfolio_chunks")

        for chunk, embedding in zip(chunks, embeddings):
            cur.execute(
                "INSERT INTO portfolio_chunks (content, metadata, embedding) VALUES (%s, %s, %s)",
                (chunk['content'], json.dumps(chunk['metadata']), embedding)
            )
        conn.commit()

def run_ingestion():
    if not PROJECT_ID:
        print("GCP_PROJECT_ID not set. Skipping ingestion.")
        return

    print("Loading content and chunking...")
    chunks = get_all_chunks()
    texts = [c['content'] for c in chunks]

    print(f"Generating embeddings for {len(chunks)} chunks...")
    embeddings = get_embeddings(texts)

    print("Connecting to Cloud SQL...")
    connector = Connector()

    def getconn():
        conn = connector.connect(
            f"{PROJECT_ID}:{REGION}:{INSTANCE_NAME}",
            "psycopg2",
            user=DB_USER,
            db=DB_NAME,
            enable_iam_auth=True
        )
        return conn

    conn = getconn()

    print("Initializing DB...")
    init_db(conn)

    print("Upserting chunks...")
    upsert_chunks(conn, chunks, embeddings)

    conn.close()
    connector.close()
    print("Ingestion complete.")

if __name__ == "__main__":
    run_ingestion()
