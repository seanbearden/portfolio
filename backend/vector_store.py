from typing import List, Optional
from .models import SearchResult
from .loader import load_blog_posts, load_publications

class SimpleVectorStore:
    def __init__(self):
        self.blog_posts = load_blog_posts()
        self.publications = load_publications()

    def search_blog(self, query: str, limit: int = 5, year: Optional[int] = None) -> List[SearchResult]:
        # For now, implementing as a simple keyword search since we want to avoid
        # heavy dependencies or mandatory API calls during initialization.
        # This can be upgraded to real embeddings easily.
        results = []
        query = query.lower()

        for post in self.blog_posts:
            if year and post.date.year != year:
                continue

            score = 0
            if query in post.title.lower():
                score += 10
            if query in post.content.lower():
                score += post.content.lower().count(query) # Basic term frequency

            if score > 0:
                results.append((score, SearchResult(
                    title=post.title,
                    url=f"https://seanbearden.com/blog/{post.slug}",
                    snippet=post.content[:200] + "...",
                    type="blog",
                    date=post.date.isoformat()
                )))

        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results[:limit]]

    def search_publications(self, query: str, limit: int = 5, year: Optional[int] = None) -> List[SearchResult]:
        results = []
        query = query.lower()

        for pub in self.publications:
            if year and str(year) != pub.year:
                continue

            score = 0
            if query in pub.title.lower():
                score += 10
            if query in pub.journal.lower():
                score += 5

            if score > 0:
                results.append((score, SearchResult(
                    title=pub.title,
                    url=pub.link,
                    snippet=f"Published in {pub.journal} ({pub.year})",
                    type="publication",
                    date=pub.year
                )))

        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results[:limit]]

vector_store = SimpleVectorStore()
