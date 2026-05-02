/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert';
import { parseFrontmatter } from './parse-frontmatter.ts';

test('parseFrontmatter handles valid frontmatter', () => {
  const input = `---
title: "Hello World"
date: 2024-05-20
slug: hello-world
---
This is the body.`;

  const result = parseFrontmatter(input);

  assert.strictEqual(result.meta.title, 'Hello World');
  assert.strictEqual(result.meta.date, '2024-05-20');
  assert.strictEqual(result.meta.slug, 'hello-world');
  assert.strictEqual(result.body, 'This is the body.');
});

test('parseFrontmatter handles valid JSON array', () => {
  const input = `---
tags: ["tag1", "tag2"]
---
Body`;

  const result = parseFrontmatter(input);

  assert.deepStrictEqual(result.meta.tags, ['tag1', 'tag2']);
});

test('parseFrontmatter handles invalid JSON array with fallback', () => {
  const input = `---
tags: [invalid, json]
---
Body`;

  const result = parseFrontmatter(input);

  // Fallback to string
  assert.strictEqual(result.meta.tags, '[invalid, json]');
});

test('parseFrontmatter handles non-array starting with [', () => {
    const input = `---
key: [not really a json array
---
Body`;

    const result = parseFrontmatter(input);

    assert.strictEqual(result.meta.key, '[not really a json array');
});

test('parseFrontmatter handles no frontmatter', () => {
  const input = 'No frontmatter here.';
  const result = parseFrontmatter(input);

  assert.deepStrictEqual(result.meta, {});
  assert.strictEqual(result.body, 'No frontmatter here.');
});
