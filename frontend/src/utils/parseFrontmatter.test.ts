import test from "node:test";
import assert from "node:assert";
import { parseFrontmatter } from "./parseFrontmatter.ts";

test("parseFrontmatter: empty input edge cases", () => {
  // Test completely empty string
  assert.deepStrictEqual(parseFrontmatter(""), {
    meta: {},
    body: "",
  });

  // Test string with no frontmatter
  assert.deepStrictEqual(parseFrontmatter("Just some content"), {
    meta: {},
    body: "Just some content",
  });

  // Test string with empty frontmatter
  assert.deepStrictEqual(parseFrontmatter("---\n\n---\nbody content"), {
    meta: {},
    body: "body content",
  });

  // Test string with single empty frontmatter delimiter (should treat as body)
  assert.deepStrictEqual(parseFrontmatter("---\nbody content"), {
    meta: {},
    body: "---\nbody content",
  });
});

test("parseFrontmatter: valid frontmatter edge cases", () => {
  // Test valid frontmatter with extra spaces
  assert.deepStrictEqual(parseFrontmatter("---\n  title  :  My Title  \n---\nbody"), {
    meta: { title: "My Title" },
    body: "body",
  });

  // Test valid frontmatter with JSON arrays
  assert.deepStrictEqual(parseFrontmatter("---\ntags: [\"a\", \"b\"]\n---\nbody"), {
    meta: { tags: ["a", "b"] },
    body: "body",
  });

  // Test valid frontmatter with quotes
  assert.deepStrictEqual(parseFrontmatter("---\ntitle: \"Quoted Title\"\n---\nbody"), {
    meta: { title: "Quoted Title" },
    body: "body",
  });
});
