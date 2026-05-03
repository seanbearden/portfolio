import unittest
from backend.tools import search_blog, search_publications, list_projects, get_about, get_resume, get_cv
from backend.loader import load_home_data
from backend.vector_store import vector_store

class TestTools(unittest.TestCase):
    def test_search_blog(self):
        results = search_blog("kaggle")
        self.assertTrue(len(results) > 0)
        self.assertIn("kaggle", results[0].title.lower() + results[0].snippet.lower())

    def test_search_publications(self):
        results = search_publications("memcomputing")
        self.assertTrue(len(results) > 0)
        self.assertIn("memcomputing", results[0].title.lower())

    def test_list_projects(self):
        results = list_projects(skill_filter="Python")
        self.assertTrue(len(results) > 0)
        for r in results:
            self.assertIn("Python", r.skills)

    def test_get_about(self):
        data = get_about()
        self.assertEqual(data.hero["name"], "Sean Bearden Ph.D.")

    def test_get_resume(self):
        url = get_resume()
        self.assertTrue(url.endswith(".pdf"))
        self.assertIn("seanbearden-assets", url)

if __name__ == "__main__":
    unittest.main()
