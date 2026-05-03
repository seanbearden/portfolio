import unittest
from unittest.mock import MagicMock, patch
import json
import numpy as np

# Mocking the database and embedding model
class SanityCheckRetrieval(unittest.TestCase):
    @patch('psycopg2.connect')
    @patch('vertexai.language_models.TextEmbeddingModel.from_pretrained')
    def test_retrieval_flow(self, mock_model_class, mock_connect):
        # Mock connection and cursor
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_connect.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur

        # Mock embedding model
        mock_model = MagicMock()
        mock_model_class.return_value = mock_model
        mock_embedding = MagicMock()
        mock_embedding.values = [0.1] * 768
        mock_model.get_embeddings.return_value = [mock_embedding]

        # Mock DB search result
        mock_cur.fetchall.return_value = [
            (
                "I earned my Ph.D. in Physics from UC San Diego under Dr. Massimiliano Di Ventra, designing dynamical-systems algorithms for constraint satisfaction problems. The search for King Turing was a central theme.",
                {"title": "Biography", "url": "/about", "type": "about", "slug": "bio-0"}
            )
        ]

        # Simulated Query Logic (simplified from what will be in the agent)
        query = "tell me about Sean's PhD"

        # 1. Get embedding for query
        from vertexai.language_models import TextEmbeddingInput
        inputs = [TextEmbeddingInput(query, "RETRIEVAL_QUERY")]
        q_emb = mock_model.get_embeddings(inputs)[0].values

        # 2. Search DB
        mock_cur.execute(
            "SELECT content, metadata FROM chunks ORDER BY embedding <=> %s LIMIT 1",
            (q_emb,)
        )
        results = mock_cur.fetchall()

        self.assertEqual(len(results), 1)
        content, metadata = results[0]
        self.assertIn("Ph.D. in Physics", content)
        self.assertEqual(metadata["title"], "Biography")
        print(f"\nSanity Check Passed: Query '{query}' returned relevant content.")

if __name__ == "__main__":
    unittest.main()
