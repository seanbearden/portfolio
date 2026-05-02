import { describe, it, expect, vi } from "vitest";
import { resolveOldUrl } from "./redirects";

vi.mock("./content", () => ({
  getBlogPosts: () => [
    { slug: "post-1", oldUrl: "/news/2020/1/1/post-1" },
    { slug: "post-2", oldUrl: "/news/2020/1/2/post-2/" },
  ],
}));

describe("resolveOldUrl", () => {
  it("resolves old URLs to new blog paths", () => {
    expect(resolveOldUrl("/news/2020/1/1/post-1")).toBe("/blog/post-1");
    expect(resolveOldUrl("/news/2020/1/2/post-2/")).toBe("/blog/post-2");
    expect(resolveOldUrl("/news/2020/1/2/post-2")).toBe("/blog/post-2");
  });

  it("falls back to /blog for unknown news paths", () => {
    expect(resolveOldUrl("/news/2021/1/1/unknown")).toBe("/blog");
  });

  it("handles PDF paths by returning null", () => {
    expect(resolveOldUrl("/s/something.pdf")).toBe(null);
  });

  it("redirects old category and tag pages to /blog", () => {
    expect(resolveOldUrl("/category/tech")).toBe("/blog");
    expect(resolveOldUrl("/tag/javascript")).toBe("/blog");
  });

  it("returns null for unrelated paths", () => {
    expect(resolveOldUrl("/about")).toBe(null);
    expect(resolveOldUrl("/")).toBe(null);
  });
});
