// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Header } from "./Header";
import * as FramerMotion from "framer-motion";

afterEach(() => {
  cleanup();
});

vi.mock("@/utils/content", () => ({
  getHomeData: () => ({
    hero: {
      name: "Sean Bearden",
      headline: "Tester",
      email: "test@example.com",
    },
    social: {
      github: "https://github.com/test",
      linkedin: "https://linkedin.com/in/test",
      twitter: "https://twitter.com/test",
      other: "https://example.com/other",
      unsupported: "https://example.com/unsupported"
    },
  }),
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

vi.mock("@/components/common/SocialIcons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/common/SocialIcons")>();
  return {
    ...actual,
    hasSocialIcon: (platform: string) => platform !== "unsupported",
  };
});

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

describe("Header", () => {
  beforeEach(() => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);
  });

  const renderHeader = (path = "/") =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Header />
      </MemoryRouter>
    );

  it("renders nav links", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /blog/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("renders social icons from home.json", () => {
    renderHeader();

    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
    expect(screen.getByLabelText("other")).toBeInTheDocument(); // platform name as fallback
    expect(screen.queryByLabelText("unsupported")).not.toBeInTheDocument();
  });

  it("renders active nav indicator when not reducing motion", () => {
    const { container } = renderHeader("/");
    // motion.div for nav-indicator should be present
    // We search for a div with the expected classes
    const indicator = container.querySelector('.bg-primary');
    expect(indicator).toBeInTheDocument();
  });
});

describe("Header with reduced motion", () => {
  beforeEach(() => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);
  });

  it("renders correctly when prefers-reduced-motion is set", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    // In reduced motion, a simple div is used for the indicator
    const indicator = document.querySelector('.bg-primary');
    expect(indicator).toBeInTheDocument();
  });
});
