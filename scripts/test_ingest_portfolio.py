import unittest
import tempfile
from pathlib import Path
from scripts.ingest_portfolio import chunk_markdown

class TestIngestRobustness(unittest.TestCase):
    def test_broken_frontmatter_fallback(self):
        """Test that chunk_markdown handles malformed YAML frontmatter gracefully."""
        broken_content = """---
title: "Inner "quotes" cause failure"
slug: "broken-frontmatter"
---
# Header 1
Body content.
"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, dir='.') as tf:
            tf.write(broken_content)
            temp_path = Path(tf.name)

        try:
            # We pass a dummy content_type
            chunks = chunk_markdown(temp_path, "blog")

            self.assertGreater(len(chunks), 0)
            # The defensive parser should have extracted the title despite the quotes
            # Note: My defensive parser strips outer quotes if they exist.
            # "Inner "quotes" cause failure" -> Inner "quotes" cause failure
            self.assertEqual(chunks[0]['metadata']['title'], "Inner \"quotes\" cause failure: Header 1")
            self.assertEqual(chunks[0]['metadata']['slug'], "broken-frontmatter")
            self.assertIn("Body content.", chunks[0]['content'])
        finally:
            temp_path.unlink()

    def test_valid_frontmatter(self):
        """Test that chunk_markdown still works for valid frontmatter."""
        valid_content = """---
title: Valid Title
slug: valid-slug
---
# Header 1
Body content.
"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, dir='.') as tf:
            tf.write(valid_content)
            temp_path = Path(tf.name)

        try:
            chunks = chunk_markdown(temp_path, "blog")
            self.assertEqual(chunks[0]['metadata']['title'], "Valid Title: Header 1")
            self.assertEqual(chunks[0]['metadata']['slug'], "valid-slug")
        finally:
            temp_path.unlink()

if __name__ == '__main__':
    unittest.main()
