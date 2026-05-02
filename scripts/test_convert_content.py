import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
import json

import convert_content

class TestSlugify(unittest.TestCase):
    def test_basic_string(self):
        self.assertEqual(convert_content.slugify("Hello World"), "hello-world")

    def test_quotes(self):
        self.assertEqual(convert_content.slugify("It's a \"Test\""), "its-a-test")

    def test_special_characters(self):
        self.assertEqual(convert_content.slugify("Hello! @World#"), "hello-world")

    def test_multiple_hyphens_and_spaces(self):
        self.assertEqual(convert_content.slugify("   Testing  ---  Spaces   "), "testing-spaces")

class TestResolveImage(unittest.TestCase):
    def test_empty_image_line(self):
        self.assertIsNone(convert_content.resolve_image("", 1))
        self.assertIsNone(convert_content.resolve_image(None, 1))

    def test_image_map_match(self):
        # exact match
        self.assertEqual(convert_content.resolve_image("Updated_Modified_Image.jpg", 1), "gcloud_next_24.webp")
        # lowercase partial match
        self.assertEqual(convert_content.resolve_image("screenshot 2024-02-16", 1), "kaggle_notebook_expert.webp")

    def test_fallback_match(self):
        # fallback is index 20 -> mini_mba.webp
        self.assertEqual(convert_content.resolve_image("Program screenshot", 20), "mini_mba.webp")

    def test_no_match(self):
        self.assertIsNone(convert_content.resolve_image("nonexistent_image.png", 99))

class TestConvertHome(unittest.TestCase):
    @patch('convert_content.Path.read_text')
    @patch('convert_content.Path.write_text')
    @patch('builtins.print')
    def test_convert_home(self, mock_print, mock_write_text, mock_read_text):
        # Setup mock return value for read_text
        mock_read_text.return_value = "Mock Markdown content for home"

        # Execute
        convert_content.convert_home()

        # Assert read_text was called
        mock_read_text.assert_called_once()

        # Assert write_text was called
        mock_write_text.assert_called_once()

        # Verify JSON content passed to write_text
        written_content = mock_write_text.call_args[0][0]
        parsed_json = json.loads(written_content)
        self.assertIn("hero", parsed_json)
        self.assertEqual(parsed_json["hero"]["name"], "Sean Bearden Ph.D.")

class TestConvertPublications(unittest.TestCase):
    @patch('convert_content.Path.read_text')
    @patch('convert_content.Path.write_text')
    @patch('builtins.print')
    def test_convert_publications(self, mock_print, mock_write_text, mock_read_text):
        mock_markdown = """
# Publications

## 1. Test Title 1
- **Journal:** Test Journal 1
- **Year:** 2024
- **Type:** Paper
- **Link:** http://example.com/1
- **Preprint:** http://example.com/preprint1

## 2. Test Title 2
- **Journal:** Test Journal 2
- **Year:** 2023
        """
        mock_read_text.return_value = mock_markdown

        # Execute
        convert_content.convert_publications()

        # Assert read_text was called
        mock_read_text.assert_called_once()

        # Assert write_text was called
        mock_write_text.assert_called_once()

        # Verify JSON content passed to write_text
        written_content = mock_write_text.call_args[0][0]
        parsed_json = json.loads(written_content)

        self.assertEqual(len(parsed_json), 2)
        self.assertEqual(parsed_json[0]["title"], "Test Title 1")
        self.assertEqual(parsed_json[0]["journal"], "Test Journal 1")
        self.assertEqual(parsed_json[0]["year"], "2024")
        self.assertEqual(parsed_json[0]["type"], "Paper")
        self.assertEqual(parsed_json[0]["link"], "http://example.com/1")
        self.assertEqual(parsed_json[0]["preprint"], "http://example.com/preprint1")

        self.assertEqual(parsed_json[1]["title"], "Test Title 2")
        self.assertEqual(parsed_json[1]["journal"], "Test Journal 2")
        self.assertEqual(parsed_json[1]["year"], "2023")
        self.assertNotIn("type", parsed_json[1])
        self.assertEqual(parsed_json[1]["link"], "")

if __name__ == '__main__':
    unittest.main()
