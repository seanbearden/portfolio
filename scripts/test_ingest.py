import unittest
from scripts.ingest import chunk_markdown

class TestIngest(unittest.TestCase):
    def test_chunk_markdown_basic(self):
        item = {
            "title": "Test Post",
            "content": "# Intro\nThis is the intro.\n## Section 1\nDetails here.\n- point 1\n- point 2",
            "type": "blog",
            "slug": "test-post",
            "url": "/blog/test-post"
        }
        chunks = chunk_markdown(item)

        # Should have 2 chunks: one for Intro, one for Section 1
        self.assertEqual(len(chunks), 2)

        self.assertEqual(chunks[0]["title"], "Test Post - Intro")
        self.assertIn("This is the intro.", chunks[0]["content"])

        self.assertEqual(chunks[1]["title"], "Test Post - Section 1")
        self.assertIn("Details here.", chunks[1]["content"])
        self.assertIn("point 1", chunks[1]["content"])
        self.assertIn("point 2", chunks[1]["content"])

    def test_chunk_markdown_no_headers(self):
        item = {
            "title": "Test Post",
            "content": "Just a paragraph.",
            "type": "blog",
            "slug": "test-post",
            "url": "/blog/test-post"
        }
        chunks = chunk_markdown(item)
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0]["title"], "Test Post")
        self.assertEqual(chunks[0]["content"], "Just a paragraph.")

if __name__ == "__main__":
    unittest.main()
