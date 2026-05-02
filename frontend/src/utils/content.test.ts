import { describe, it, expect, vi } from 'vitest';
import {
  parseAndSortBlogPosts,
  getBlogPosts,
  getBlogPost,
  parseAndSortProjects,
  getProjects,
  getPublications,
  getHomeData
} from './content.ts';

vi.mock("../../../content/publications.json", () => ({
  default: [
    { title: "Test Pub", year: 2024, journal: "Test Journal", url: "x" },
  ],
}));

vi.mock("../../../content/home.json", () => ({
  default: {
    hero: {
      name: "Test",
      headline: "Tester",
      email: "test@example.com",
    },
    social: { github: "https://github.com/x" },
    experience: [],
    education: [],
    awards: [],
    skills: {},
    about: "Test about",
    bio: ["Test bio"],
    interests: [],
    press: [],
  },
}));

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


});

describe('getBlogPosts', () => {
  it('should return a memoized array of posts', () => {
    const posts1 = getBlogPosts();
    const posts2 = getBlogPosts();

    // Should return the exact same array reference due to memoization
    expect(posts1).toBe(posts2);
  });
});

describe('getBlogPost', () => {
  it('should return a post by slug', () => {
    const posts = getBlogPosts();
    if (posts.length > 0) {
      const post = getBlogPost(posts[0].slug);
      expect(post).toBeDefined();
      expect(post?.slug).toBe(posts[0].slug);
    }
  });

  it('should return undefined for nonexistent slug', () => {
    expect(getBlogPost('nonexistent-slug')).toBeUndefined();
  });
});

describe('parseAndSortProjects', () => {
  it('should sort projects by order in ascending order', () => {
    const mockModules = {
      'p1.md': '---\ntitle: Project 1\norder: 2\nslug: p-1\n---\nBody 1',
      'p2.md': '---\ntitle: Project 2\norder: 1\nslug: p-2\n---\nBody 2',
    };

    const projects = parseAndSortProjects(mockModules);

    expect(projects).toHaveLength(2);
    expect(projects[0].title).toBe('Project 2');
    expect(projects[1].title).toBe('Project 1');
  });

  it('should handle missing order by defaulting to 0', () => {
    const mockModules = {
      'p1.md': '---\ntitle: Project 1\norder: 2\nslug: p-1\n---\nBody 1',
      'p2.md': '---\ntitle: Project 2\nslug: p-2\n---\nBody 2',
    };

    const projects = parseAndSortProjects(mockModules);

    expect(projects).toHaveLength(2);
    expect(projects[0].title).toBe('Project 2'); // 0 comes before 2
    expect(projects[1].title).toBe('Project 1');
  });
});

describe('getProjects', () => {
  it('should return a memoized array of projects', () => {
    const projects1 = getProjects();
    const projects2 = getProjects();
    expect(projects1).toBe(projects2);
  });
});

describe('getPublications', () => {
  it('should return the publications JSON', () => {
    const publications = getPublications();
    expect(publications).toHaveLength(1);
    expect(publications[0].title).toBe('Test Pub');
  });
});

describe('getHomeData', () => {
  it('should return the home data JSON', () => {
    const homeData = getHomeData();
    expect(homeData.hero.name).toBe('Test');
  });
});
