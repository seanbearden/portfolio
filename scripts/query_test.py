import os
import json

if not os.environ.get("SIMULATE") and os.environ.get("GCP_PROJECT_ID"):
    from google.cloud import aiplatform
    from google.cloud.sql.connector import Connector
    import psycopg2
    from pgvector.psycopg2 import register_vector
    from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

# Configuration
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
REGION = os.environ.get("GCP_REGION", "us-central1")
INSTANCE_NAME = os.environ.get("GCP_SQL_INSTANCE", "portfolio-db")
DB_NAME = "portfolio_vector"
DB_USER = os.environ.get("GCP_SQL_USER")

def get_query_embedding(query):
    """Generate embedding for the query."""
    aiplatform.init(project=PROJECT_ID, location=REGION)
    model = TextEmbeddingModel.from_pretrained("gemini-embedding-001")
    inputs = [TextEmbeddingInput(query, "RETRIEVAL_QUERY")]
    embeddings = model.get_embeddings(inputs)
    return embeddings[0].values

def query_vector_store(query_text, limit=3):
    if not PROJECT_ID or os.environ.get("SIMULATE"):
        print("Simulating query...")
        return [
            {"content": "PhD Research: The Search For King Turing's Stolen Treasure...", "metadata": {"title": "PhD Research", "slug": "understanding-my-phd-research-the-search-for-king-turings-stolen-treasure"}}
        ]

    embedding = get_query_embedding(query_text)

    connector = Connector()
    def getconn():
        return connector.connect(
            f"{PROJECT_ID}:{REGION}:{INSTANCE_NAME}",
            "psycopg2",
            user=DB_USER,
            db=DB_NAME,
            enable_iam_auth=True
        )

    conn = getconn()
    register_vector(conn)
    with conn.cursor() as cur:
        cur.execute(
            "SELECT content, metadata, 1 - (embedding <=> %s::vector) AS similarity FROM portfolio_chunks ORDER BY embedding <=> %s::vector LIMIT %s",
            (embedding, embedding, limit)
        )
        results = []
        for row in cur.fetchall():
            results.append({
                "content": row[0],
                "metadata": row[1],
                "similarity": row[2]
            })

    conn.close()
    connector.close()
    return results

if __name__ == "__main__":
    query = "tell me about Sean's PhD"
    print(f"Querying: {query}")
    results = query_vector_store(query)

    for i, res in enumerate(results):
        print(f"\nResult {i+1}:")
        print(f"Title: {res['metadata'].get('title')}")
        print(f"Similarity: {res.get('similarity', 'N/A')}")
        print(f"Content: {res['content'][:200]}...")
