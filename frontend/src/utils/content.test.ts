import { describe, it, expect } from 'vitest';
import { parseAndSortBlogPosts, getBlogPosts } from './content.ts';

describe('parseAndSortBlogPosts', () => {
  it('should sort blog posts by date in descending order', () => {
    // Simulate Vite's import.meta.glob output
    const mockModules = {
      'file1.md': '---\ntitle: Post 1\ndate: 2023-01-01\nslug: post-1\n---\nBody 1',
      'file2.md': '---\ntitle: Post 2\ndate: 2023-12-31\nslug: post-2\n---\nBody 2',
      'file3.md': '---\ntitle: Post 3\ndate: 2023-06-15\nslug: post-3\n---\nBody 3',
    };

    const posts = parseAndSortBlogPosts(mockModules);

    expect(posts).toHaveLength(3);

    // Check descending order (newest first)
    expect(posts[0].title).toBe('Post 2'); // 2023-12-31
    expect(posts[1].title).toBe('Post 3'); // 2023-06-15
    expect(posts[2].title).toBe('Post 1'); // 2023-01-01
  });

  it('should handle empty or missing dates gracefully by putting them last', () => {
    const mockModules = {
      'no-date.md': '---\ntitle: No Date\n---\nBody',
      'with-date.md': '---\ntitle: With Date\ndate: 2023-01-01\n---\nBody',
    };

    const posts = parseAndSortBlogPosts(mockModules);

    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe('With Date');
    expect(posts[1].title).toBe('No Date');
  });

  it('should handle empty raw content gracefully', () => {
    const mockModules = {
      'valid.md': '---\ntitle: Valid\ndate: 2023-01-01\n---\nBody',
      'invalid.md': '' as string,
    };

    const posts = parseAndSortBlogPosts(mockModules);

    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe('Valid');
    // The invalid one parses as empty string, so it will have empty date and go to the end
    expect(posts[1].date).toBe('');
  });
});

describe('getBlogPosts', () => {
  it('should return a memoized array of posts', () => {
    const posts1 = getBlogPosts();
    const posts2 = getBlogPosts();

    // Should return the exact same array reference due to memoization
    expect(posts1).toBe(posts2);
  });
});
