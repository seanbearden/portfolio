// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import * as FramerMotion from "framer-motion";

const mockHomeData = {
  hero: {
    name: "Sean Bearden",
    headline: "Data Scientist",
    email: "sean@example.com",
    illustration: "hero_v1_bleed.svg",
    illustrationAlt: "Abstract illustration of scientist, builder, leader",
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
};

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

vi.mock("@/utils/content", () => ({
  extractYouTubeId: () => null,
  youtubeThumbnail: (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  getHomeData: () => mockHomeData,
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

import { HomePage } from "./HomePage";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);
  });

  it("renders the name and headline from home data", async () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
    expect(screen.getByText(/Data Scientist/i)).toBeInTheDocument();
  });
});

describe("HomePage with reduced motion", () => {
  beforeEach(() => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders correctly when prefers-reduced-motion is set", async () => {
    renderWithRouter(<HomePage />);

    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it("renders the hero illustration with correct alt text", () => {
    renderWithRouter(<HomePage />);
    const illustration = screen.getByAltText(mockHomeData.hero.illustrationAlt);
    expect(illustration).toBeInTheDocument();
    expect(illustration).toHaveAttribute("src", expect.stringContaining(mockHomeData.hero.illustration));
  });
});
