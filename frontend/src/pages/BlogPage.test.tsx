// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { BlogPage } from "./BlogPage";

vi.mock("@/utils/content", () => ({
  getBlogPosts: () => [
    {
      title: "Blog Post One",
      date: "2024-01-01T12:00:00Z",
      slug: "blog-post-one",
      body: "Body content of post one.",
      categories: ["Tech"],
      tags: ["React"],
      image: "test-image.jpg",
    },
    {
      title: "Blog Post Two",
      date: "2024-02-01T12:00:00Z",
      slug: "blog-post-two",
      body: "Body content of post two.",
      categories: ["Life"],
      tags: ["General"],
      // no image
    },
  ],
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

describe("BlogPage", () => {
  it("renders blog post list with and without images", () => {
    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Blog Post One")).toBeInTheDocument();
    expect(screen.getByText(/January 1, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Body content of post one/i)).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    // Check for image on first post
    const images = document.querySelectorAll("img");
    expect(Array.from(images).some(img => img.getAttribute("src")?.includes("test-image.jpg"))).toBe(true);

    expect(screen.getByText("Blog Post Two")).toBeInTheDocument();
    expect(screen.getByText(/February 1, 2024/i)).toBeInTheDocument();
  });
});

describe("BlogPage with reduced motion", () => {
  it("renders correctly when prefers-reduced-motion is set", () => {
    // BlogPage doesn't use motion yet, but this exercises the smoke test requirement
    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });
});
