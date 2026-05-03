/**
 * Sanitizes a string for use in a meta description.
 *
 * Strips common markdown so social-card snippets are clean prose:
 * - links `[text](url)` → just the text
 * - headers / emphasis / inline code chars (#, *, `, _, ~) removed
 * - whitespace collapsed
 *
 * Earlier version only removed `#*\`` which left link syntax in the
 * description. See PR #208 review.
 */
export function sanitizeDescription(text: string, length = 160): string {
  if (!text) return "";

  const plainText = text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[#*`_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= length) return plainText;

  return plainText.slice(0, length).trim() + "...";
}

/**
 * Shared site-wide constants for SEO.
 */
export const SEO_CONFIG = {
  siteUrl: "https://seanbearden.com",
  defaultTitle: "Sean Bearden, Ph.D. — Data Scientist & Researcher",
  defaultDescription: "Portfolio of Sean Bearden, Ph.D. — Data Scientist, Researcher, and Cloud Architect.",
  defaultImage: "/og-main.png",
  twitterUsername: "@seanbearden",
};
