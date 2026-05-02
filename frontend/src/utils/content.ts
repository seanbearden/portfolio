import type { BlogPost, PortfolioProject, Publication, HomeData } from "@/types/content";
import { parseFrontmatter } from "./parseFrontmatter.ts";


function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

const ASSETS_BASE = import.meta.env.VITE_ASSETS_BASE_URL ?? "";

export function assetUrl(filename: string): string {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${ASSETS_BASE}/images/${filename}`;
}

export function pdfUrl(filename: string): string {
  return `${ASSETS_BASE}/pdfs/${filename}`;
}

// --- Blog posts ---

const blogModules = import.meta.glob<string>("../../../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export function parseAndSortBlogPosts(modules: Record<string, string>): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const [, raw] of Object.entries(modules)) {
    const { meta, body } = parseFrontmatter(raw);
    posts.push({
      title: getString(meta.title),
      date: getString(meta.date),
      slug: getString(meta.slug),
      oldUrl: getString(meta.oldUrl),
      categories: getStringArray(meta.categories),
      tags: getStringArray(meta.tags),
      image: getOptionalString(meta.image),
      body,
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

let _blogPosts: BlogPost[] | null = null;

export function getBlogPosts(): BlogPost[] {
  if (_blogPosts) return _blogPosts;
  const posts = parseAndSortBlogPosts(blogModules);
  _blogPosts = posts;
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

// --- Portfolio projects ---

const portfolioModules = import.meta.glob<string>("../../../content/portfolio/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

let _projects: PortfolioProject[] | null = null;

export function getProjects(): PortfolioProject[] {
  if (_projects) return _projects;

  const projects: PortfolioProject[] = [];
  for (const [, raw] of Object.entries(portfolioModules)) {
    const { meta, body } = parseFrontmatter(raw);
    projects.push({
      title: getString(meta.title),
      subtitle: getOptionalString(meta.subtitle),
      slug: getString(meta.slug),
      order: Number(meta.order) || 0,
      skills: getStringArray(meta.skills),
      link: getOptionalString(meta.link),
      cta: getOptionalString(meta.cta),
      image: getOptionalString(meta.image),
      body,
    });
  }

  projects.sort((a, b) => a.order - b.order);
  _projects = projects;
  return projects;
}

// --- Publications ---

import publicationsJson from "../../../content/publications.json";

export function getPublications(): Publication[] {
  return publicationsJson as Publication[];
}

// --- Home data ---

import homeJson from "../../../content/home.json";

export function getHomeData(): HomeData {
  return homeJson as HomeData;
}
