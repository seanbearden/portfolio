import type { BlogPost, PortfolioProject, Publication, HomeData } from "@/types/content";

const ASSETS_BASE = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_ASSETS_BASE_URL : "";

export function assetUrl(filename: string): string {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${ASSETS_BASE}/images/${filename}`;
}

export function pdfUrl(filename: string): string {
  return `${ASSETS_BASE}/pdfs/${filename}`;
}

// --- Blog posts ---

interface RawMarkdown {
  default: string;
  frontmatter: Record<string, unknown>;
}

const blogModules = typeof import.meta.glob !== 'undefined' ? import.meta.glob<RawMarkdown>("../../../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) : {};

export function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Remove surrounding quotes
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    // Parse JSON arrays
    if (val.startsWith("[")) {
      try {
        meta[key] = JSON.parse(val);
        continue;
      } catch { /* fall through */ }
    }
    meta[key] = val;
  }
  return { meta, body: match[2].trim() };
}

let _blogPosts: BlogPost[] | null = null;

export function getBlogPosts(): BlogPost[] {
  if (_blogPosts) return _blogPosts;

  const posts: BlogPost[] = [];
  for (const [, raw] of Object.entries(blogModules)) {
    const content = typeof raw === "string" ? raw : "";
    const { meta, body } = parseFrontmatter(content);
    posts.push({
      title: (meta.title as string) ?? "",
      date: (meta.date as string) ?? "",
      slug: (meta.slug as string) ?? "",
      oldUrl: (meta.oldUrl as string) ?? "",
      categories: (meta.categories as string[]) ?? [],
      tags: (meta.tags as string[]) ?? [],
      image: meta.image as string | undefined,
      body,
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  _blogPosts = posts;
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

// --- Portfolio projects ---

const portfolioModules = typeof import.meta.glob !== 'undefined' ? import.meta.glob<string>("../../../content/portfolio/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) : {};

let _projects: PortfolioProject[] | null = null;

export function getProjects(): PortfolioProject[] {
  if (_projects) return _projects;

  const projects: PortfolioProject[] = [];
  for (const [, raw] of Object.entries(portfolioModules)) {
    const content = typeof raw === "string" ? raw : "";
    const { meta, body } = parseFrontmatter(content);
    projects.push({
      title: (meta.title as string) ?? "",
      slug: (meta.slug as string) ?? "",
      order: Number(meta.order) || 0,
      skills: (meta.skills as string[]) ?? [],
      link: meta.link as string | undefined,
      relatedPublication: meta.relatedPublication as string | undefined,
      image: meta.image as string | undefined,
      body,
    });
  }

  projects.sort((a, b) => a.order - b.order);
  _projects = projects;
  return projects;
}

// --- Publications ---

import publicationsJson from "../../../content/publications.json" with { type: "json" };

export function getPublications(): Publication[] {
  return publicationsJson as Publication[];
}

// --- Home data ---

import homeJson from "../../../content/home.json" with { type: "json" };

export function getHomeData(): HomeData {
  return homeJson as HomeData;
}
