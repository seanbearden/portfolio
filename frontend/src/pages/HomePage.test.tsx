// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { HomePage } from "./HomePage";

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
  const renderPage = () =>
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

  it("renders the name and headline from home data", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Sean Bearden/i })).toBeInTheDocument();
    expect(screen.getByText(/Data Scientist/i)).toBeInTheDocument();
  });

  it("renders the about preview", () => {
    renderPage();
    expect(screen.getByText("This is a bio about me.")).toBeInTheDocument();
  });

  it("renders featured project cards", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Test Project/i })).toBeInTheDocument();
    expect(screen.getByText("Sub")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("View Project")).toBeInTheDocument();
  });

  it("renders recent blog posts", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Test Post/i })).toBeInTheDocument();
    expect(screen.getByText(/Post content snippet/i)).toBeInTheDocument();
  });
});
