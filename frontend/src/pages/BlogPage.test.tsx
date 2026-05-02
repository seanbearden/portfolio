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
    },
  ],
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

describe("BlogPage", () => {
  it("renders blog post list", () => {
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
  });
});
