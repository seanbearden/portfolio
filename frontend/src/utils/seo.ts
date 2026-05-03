/**
 * Sanitizes a string for use in a meta description.
 * Removes Markdown formatting characters like #, *, and `.
 */
export function sanitizeDescription(text: string, length = 160): string {
  if (!text) return "";

  // Basic markdown removal and whitespace normalization
  const plainText = text
    .replace(/[#*`]/g, "")
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
