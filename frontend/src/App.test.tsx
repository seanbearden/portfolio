// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App, { AppRoutes } from "./App";

vi.mock("@/utils/content", () => ({
  extractYouTubeId: () => null,
  youtubeThumbnail: (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  getHomeData: () => ({
    hero: {
      name: "Sean Bearden",
      headline: "Data Scientist",
      email: "sean@example.com",
    },
    social: { github: "https://github.com/test" },
    experience: [],
    education: [],
    awards: [],
    skills: {},
    about: "This is a bio about me.",
    bio: ["This is a bio about me."],
    interests: ["Physics", "ML"],
    press: [],
  }),
  getProjects: () => [
    {
      title: "Test Project",
      subtitle: "Sub",
      slug: "test-project",
      body: "Test project body content.",
      skills: ["TypeScript"],
      link: "https://example.com",
      cta: "View Project",
    },
  ],
  getBlogPosts: () => [
    {
      title: "Test Post",
      body: "Post content snippet.",
      date: "2024-01-01",
      slug: "test-post",
      categories: [],
      tags: [],
    },
  ],
  getBlogPost: (slug: string) => {
    if (slug === "test-post") {
      return {
        title: "Test Post",
        body: "Full post content.",
        date: "2024-01-01",
        slug: "test-post",
        categories: [],
        tags: [],
      };
    }
    return undefined;
  },
  getPublications: () => [
    {
      title: "Test Publication",
      journal: "Test Journal",
      year: "2024",
      link: "https://example.com/pub",
    },
  ],
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
  pdfUrl: (f: string) => `https://cdn.example.com/pdfs/${f}`,
}));

describe("App Route Table", () => {
  const renderAppRoutes = (initialRoute: string) =>
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AppRoutes />
      </MemoryRouter>
    );

  it("renders HomePage for /", () => {
    renderAppRoutes("/");
    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
  });

  it("renders AboutPage for /about", () => {
    renderAppRoutes("/about");
    expect(screen.getByRole("heading", { name: /^About$/i })).toBeInTheDocument();
  });

  it("renders PortfolioPage for /portfolio", () => {
    renderAppRoutes("/portfolio");
    expect(screen.getByRole("heading", { name: /^Portfolio$/i })).toBeInTheDocument();
  });

  it("renders BlogPage for /blog", () => {
    renderAppRoutes("/blog");
    expect(screen.getByRole("heading", { name: /^Blog$/i })).toBeInTheDocument();
  });

  it("renders BlogPostPage for /blog/test-post", () => {
    renderAppRoutes("/blog/test-post");
    expect(screen.getByRole("heading", { name: /Test Post/i })).toBeInTheDocument();
  });

  it("renders PublicationsPage for /publications", () => {
    renderAppRoutes("/publications");
    expect(screen.getByRole("heading", { name: /^Publications$/i })).toBeInTheDocument();
  });

  it("renders ContactPage for /contact", () => {
    renderAppRoutes("/contact");
    expect(screen.getByRole("heading", { name: /Get in Touch/i })).toBeInTheDocument();
  });

  it("renders NotFoundPage for unknown routes", () => {
    renderAppRoutes("/some-random-route");
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  it("renders main App component without crashing", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
  });
});
