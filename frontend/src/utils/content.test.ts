import test from 'node:test';
import assert from 'node:assert';

// Mock import.meta for content.ts (this needs to be done BEFORE importing content.ts if possible)
// But we can't easily mock import.meta for a module we are about to import in Node.js ESM without loaders.
// However, we can try to use a trick if content.ts was using globalThis or if we use a loader.
// Since we are using node --test, we can try to provide a mock via globalThis if the code was designed for it,
// but it's using import.meta.env directly.

import { parseFrontmatter } from './content.ts';

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
