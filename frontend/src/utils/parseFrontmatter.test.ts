import { test, expect } from "vitest";
import { parseFrontmatter } from "./parseFrontmatter.ts";

test("parseFrontmatter: empty input edge cases", () => {
  // Test completely empty string
  expect(parseFrontmatter("")).toEqual({
    meta: {},
    body: "",
  });

  // Test string with no frontmatter
  expect(parseFrontmatter("Just some content")).toEqual({
    meta: {},
    body: "Just some content",
  });

  // Test string with empty frontmatter
  expect(parseFrontmatter("---\n\n---\nbody content")).toEqual({
    meta: {},
    body: "body content",
  });

  // Test string with single empty frontmatter delimiter (should treat as body)
  expect(parseFrontmatter("---\nbody content")).toEqual({
    meta: {},
    body: "---\nbody content",
  });
});

test("parseFrontmatter: valid frontmatter edge cases", () => {
  // Test valid frontmatter with extra spaces
  expect(parseFrontmatter("---\n  title  :  My Title  \n---\nbody")).toEqual({
    meta: { title: "My Title" },
    body: "body",
  });

  // Test valid frontmatter with JSON arrays
  expect(parseFrontmatter("---\ntags: [\"a\", \"b\"]\n---\nbody")).toEqual({
    meta: { tags: ["a", "b"] },
    body: "body",
  });

  // Test valid frontmatter with quotes
  expect(parseFrontmatter("---\ntitle: \"Quoted Title\"\n---\nbody")).toEqual({
    meta: { title: "Quoted Title" },
    body: "body",
  });
});
