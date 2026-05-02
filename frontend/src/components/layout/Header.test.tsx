// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Header } from "./Header";

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
    },
  }),
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

describe("Header", () => {
  const renderHeader = () =>
    render(
      <MemoryRouter>
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
    const { container } = renderHeader();
    // 2 social icons (github + linkedin) per the mock
    const socialLinks = container.querySelectorAll('a[target="_blank"]');
    expect(socialLinks.length).toBeGreaterThanOrEqual(2);

    const githubLink = Array.from(socialLinks).find(a => a.getAttribute("href") === "https://github.com/test");
    expect(githubLink).toBeDefined();
  });
});
