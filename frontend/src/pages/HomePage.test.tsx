// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("@/utils/content", () => ({
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
      skills: ["TypeScript"],
      link: "https://example.com",
      cta: "View Project",
      image: "project1.jpg"
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
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
  pdfUrl: (f: string) => `https://cdn.example.com/pdfs/${f}`,
}));

describe("HomePage", () => {
  it("renders the name and headline from home data", async () => {
    const { HomePage } = await import("./HomePage");
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
    expect(screen.getByText(/Data Scientist/i)).toBeInTheDocument();
  });
});

describe("HomePage with reduced motion", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("renders correctly when prefers-reduced-motion is set", async () => {
    vi.resetModules();
    const { HomePage } = await import("./HomePage");
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });
});
