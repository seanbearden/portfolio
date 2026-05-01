import { getBlogPosts } from "./content";

let _oldUrlMap: Map<string, string> | null = null;

function getOldUrlMap() {
  if (_oldUrlMap) return _oldUrlMap;

  _oldUrlMap = new Map();
  const posts = getBlogPosts();
  for (const post of posts) {
    if (post.oldUrl) {
      _oldUrlMap.set(post.oldUrl, post.slug);
      // If the old URL has a trailing slash, also index the version without it
      if (post.oldUrl.endsWith("/")) {
        _oldUrlMap.set(post.oldUrl.replace(/\/$/, ""), post.slug);
      }
    }
  }
  return _oldUrlMap;
}

/**
 * Check if the current path is an old Squarespace URL and return the new path.
 */
export function resolveOldUrl(pathname: string): string | null {
  // Old blog URLs: /news/YYYY/M/D/slug
  if (pathname.startsWith("/news/")) {
    const map = getOldUrlMap();
    const slug = map.get(pathname);
    if (slug) return `/blog/${slug}`;

    // Try without trailing slash if not already found
    const trimmed = pathname.replace(/\/$/, "");
    const slug2 = map.get(trimmed);
    if (slug2) return `/blog/${slug2}`;

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
