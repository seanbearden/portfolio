// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { ContactPage } from "./ContactPage";

vi.mock("@/utils/content", () => ({
  getHomeData: () => ({
    hero: {
      email: "sean@example.com",
    },
    social: {
      github: "https://github.com/sean",
      linkedin: "https://linkedin.com/in/sean",
      unsupported: "https://example.com",
    },
  }),
}));

vi.mock("@/components/common/SocialIcons", () => ({
  SocialIcon: ({ platform }: { platform: string }) => <span>{platform} icon</span>,
  hasSocialIcon: (platform: string) => platform !== "unsupported",
}));

describe("ContactPage", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders contact info and supported social links", () => {
    render(<ContactPage />);

    expect(screen.getByText("sean@example.com")).toBeInTheDocument();
    expect(screen.getByText("github icon")).toBeInTheDocument();
    expect(screen.getByText("linkedin icon")).toBeInTheDocument();
    expect(screen.queryByText("unsupported icon")).not.toBeInTheDocument();

    const emailLink = screen.getByRole("link", { name: /sean@example.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:sean@example.com");
  });

  it("copies email to clipboard on click and shows feedback (regression guard for silently-failing mailto:)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ContactPage />);

    const emailLink = screen.getByRole("link", { name: /Email sean@example.com/i });

    // Prevent jsdom from attempting actual mailto: navigation
    emailLink.addEventListener("click", (e) => e.preventDefault(), { once: true });
    fireEvent.click(emailLink);

    expect(writeText).toHaveBeenCalledWith("sean@example.com");
    expect(screen.getByText("Copied!")).toBeInTheDocument();
    expect(screen.getByText("Email copied to clipboard.")).toBeInTheDocument();

    // Feedback clears after 2s
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("sean@example.com")).toBeInTheDocument();
  });

  it("does not preventDefault on click — preserves mailto: navigation for users with a mail client", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<ContactPage />);
    const emailLink = screen.getByRole("link", { name: /Email sean@example.com/i });

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    emailLink.dispatchEvent(event);

    // If the handler called preventDefault, mailto: would be suppressed for
    // users who DO have a mail client. Make sure it doesn't.
    expect(event.defaultPrevented).toBe(false);
  });

  it("survives clipboard.writeText rejection (e.g. permission denied) without throwing", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("permission denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ContactPage />);
    const emailLink = screen.getByRole("link", { name: /Email sean@example.com/i });
    emailLink.addEventListener("click", (e) => e.preventDefault(), { once: true });

    // Should not throw even though writeText rejects
    fireEvent.click(emailLink);

    // UI feedback still fires regardless of clipboard outcome
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});

describe("ContactPage with reduced motion", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("renders correctly when prefers-reduced-motion is set", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });
});
