import { getBlogPosts } from "./content";

/**
 * Check if the current path is an old Squarespace URL and return the new path.
 */
export function resolveOldUrl(pathname: string): string | null {
  // Old blog URLs: /news/YYYY/M/D/slug
  if (pathname.startsWith("/news/")) {
    const posts = getBlogPosts();
    const match = posts.find((p) => p.oldUrl === pathname);
    if (match) return `/blog/${match.slug}`;
    // Try without trailing slash
    const trimmed = pathname.replace(/\/$/, "");
    const match2 = posts.find((p) => p.oldUrl === trimmed);
    if (match2) return `/blog/${match2.slug}`;
    // Fall back to blog index
    return "/blog";
  }

  // Old PDF paths
  if (pathname.startsWith("/s/")) return null; // Let these 404 gracefully

  // Old category/tag pages
  if (pathname.includes("/category/") || pathname.includes("/tag/")) {
    return "/blog";
  }

  return null;
}
