/**
 * Shared CTA-link helpers used by HomePage and PortfolioPage.
 *
 * The home/portfolio JSON allows a project's "link" field to be a special
 * action keyword (currently just "chat") instead of a plain URL. When the
 * user clicks one of these, we dispatch a window event that the chatbot
 * popup listens for, and prevent default navigation so we don't leave the
 * page.
 *
 * Centralizing here so the two pages don't drift on the keyword set or the
 * external-link rel attributes.
 */

export const CTA_OPEN_CHAT_EVENT = "portfolio-agent:open";

/** Click handler for hero/CTA buttons whose link is an action keyword. */
export function handleCtaClick(e: React.MouseEvent, action: string) {
  if (action === "chat") {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(CTA_OPEN_CHAT_EVENT));
  }
}

/** Anchor attrs (target/rel/onClick/href) for a configurable link.
 *  Returns props ready to spread onto `<a>`. */
export function ctaAnchorProps(link: string | undefined) {
  if (!link) return undefined;
  if (link === "#chat") {
    return {
      href: "#chat",
      onClick: (e: React.MouseEvent) => handleCtaClick(e, "chat"),
    };
  }
  // External URL — open in new tab with proper rel.
  return {
    href: link,
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
  };
}
