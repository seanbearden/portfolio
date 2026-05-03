// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { BlogPostPage } from "./BlogPostPage";

vi.mock("@/utils/content", () => ({
  getBlogPost: (slug: string) => {
    if (slug === "test-post") {
      return {
        title: "Test Blog Post",
        date: "2024-01-01T12:00:00Z",
        slug: "test-post",
        body: "# Hello World\n\nThis is a test blog post.",
        categories: ["Testing"],
        tags: ["React", "Vitest"],
        image: "test-image.jpg",
      };
    }
    return undefined;
  },
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

describe("BlogPostPage", () => {
  it("renders post content when slug matches", () => {
    render(
      <MemoryRouter initialEntries={["/blog/test-post"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
    expect(screen.getByText(/January 1, 2024/i)).toBeInTheDocument();
    expect(screen.getByText("Testing")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vitest")).toBeInTheDocument();

    // Check markdown rendering
    const heading = screen.getByRole("heading", { name: /Hello World/i, level: 1 });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/This is a test blog post/i)).toBeInTheDocument();

    // Check image
    // The img in BlogPostPage has alt="", which often makes it presentational or ignored.
    const image = screen.getByAltText("");
    expect(image).toHaveAttribute("src", "https://cdn.example.com/test-image.jpg");
  });

  it("redirects to /blog when slug does not match", () => {
    render(
      <MemoryRouter initialEntries={["/blog/nonexistent"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/blog" element={<div>Blog Index Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Blog Index Page")).toBeInTheDocument();
    expect(screen.queryByText("Test Blog Post")).not.toBeInTheDocument();
  });

  it("redirects when no slug param is present", () => {
    render(
      <MemoryRouter initialEntries={["/test-no-slug"]}>
        <Routes>
          <Route path="/test-no-slug" element={<BlogPostPage />} />
          <Route path="/blog" element={<div>Blog Index Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Blog Index Page")).toBeInTheDocument();
  });
});
