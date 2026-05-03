// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PortfolioPage } from "./PortfolioPage";
import * as FramerMotion from "framer-motion";

vi.mock("@/utils/content", () => ({
  getProjects: () => [
    {
      title: "Portfolio Project 1",
      slug: "portfolio-project-1",
      body: "This is a detailed description of the project 1.",
      skills: ["React", "Vite"],
      link: "https://github.com/test/project1",
      image: "project1.jpg",
      cta: "View Now",
      subtitle: "Subtitle 1"
    },
    {
      title: "Portfolio Project 2",
      slug: "portfolio-project-2",
      body: "A short one.",
      skills: ["Python"],
      // no image, no link, no subtitle, body.length <= 200
    },
    {
        title: "Portfolio Project 3",
        slug: "portfolio-project-3",
        body: "A".repeat(201),
        skills: ["JS"],
        link: "https://example.com"
        // no cta, body.length > 200
    }
  ],
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

describe("PortfolioPage", () => {
  beforeEach(() => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);
  });

  it("renders project details", () => {
    render(<PortfolioPage />);
    expect(screen.getByText("Portfolio Project 1")).toBeInTheDocument();
    expect(screen.getByText("Subtitle 1")).toBeInTheDocument();
    expect(screen.getByText(/View Now/i)).toBeInTheDocument();

    expect(screen.getByText("Portfolio Project 2")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Project 3")).toBeInTheDocument();
    expect(screen.getByText(/View Project/i)).toBeInTheDocument(); // default cta
  });
});

describe("PortfolioPage with reduced motion", () => {
  beforeEach(() => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders correctly when prefers-reduced-motion is set", () => {
    render(<PortfolioPage />);
    expect(screen.getByText("Portfolio Project 1")).toBeInTheDocument();
  });
});
