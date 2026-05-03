import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "./parseFrontmatter";

describe("parseFrontmatter", () => {
  it("handles empty input edge cases", () => {
    expect(parseFrontmatter("")).toEqual({
      meta: {},
      body: "",
    });

    expect(parseFrontmatter("Just some content")).toEqual({
      meta: {},
      body: "Just some content",
    });

    expect(parseFrontmatter("---\n\n---\nbody content")).toEqual({
      meta: {},
      body: "body content",
    });

    expect(parseFrontmatter("---\nbody content")).toEqual({
      meta: {},
      body: "---\nbody content",
    });
  });

  it("handles valid frontmatter edge cases", () => {
    expect(parseFrontmatter("---\n  title  :  My Title  \n---\nbody")).toEqual({
      meta: { title: "My Title" },
      body: "body",
    });

    expect(parseFrontmatter("---\ntags: [\"a\", \"b\"]\n---\nbody")).toEqual({
      meta: { tags: ["a", "b"] },
      body: "body",
    });

    expect(parseFrontmatter("---\ntitle: \"Quoted Title\"\n---\nbody")).toEqual({
      meta: { title: "Quoted Title" },
      body: "body",
    });
  });

  it("falls back to raw string when YAML array is malformed", () => {
    expect(parseFrontmatter("---\ntags: [not valid json\n---\nbody")).toEqual({
      meta: { tags: "[not valid json" },
      body: "body",
    });
  });

  it("strips quotes in fallback parser when gray-matter fails", () => {
    // Malformed YAML (e.g., unclosed bracket) to trigger fallback
    const malformed = `---
title: "Quoted Title"
link: 'https://example.com'
tags: [malformed
---
body`;
    expect(parseFrontmatter(malformed)).toEqual({
      meta: {
        title: "Quoted Title",
        link: "https://example.com",
        tags: "[malformed",
      },
      body: "body",
    });
  });
});
