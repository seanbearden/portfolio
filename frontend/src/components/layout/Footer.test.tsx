// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Footer } from "./Footer";

afterEach(() => {
  cleanup();
});

vi.mock("@/utils/content", () => ({
  getHomeData: () => ({
    hero: {
      name: "Sean Bearden",
      headline: "Tester",
      email: "test@example.com",
    },
    social: {
      github: "https://github.com/test",
    },
  }),
  pdfUrl: (f: string) => `https://cdn.example.com/pdfs/${f}`,
}));

describe("Footer", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

  it("renders copyright with current year", () => {
    renderFooter();
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    expect(screen.getByText(/Sean Bearden, Ph.D./)).toBeInTheDocument();
  });

  it("renders Resume link", () => {
    renderFooter();
    const resumeLink = screen.getByRole("link", { name: /resume/i });
    expect(resumeLink).toBeInTheDocument();
    expect(resumeLink.getAttribute("href")).toContain("Bearden_Resume_Online.pdf");
  });

  it("renders Contact link to /contact (not mailto:, which silently fails without a mail client)", () => {
    renderFooter();
    const contactLink = screen.getByRole("link", { name: /contact/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.getAttribute("href")).toBe("/contact");
    // Regression guard: do NOT regress to mailto: — that silently fails for
    // users whose browser/OS has no default mail client configured.
    expect(contactLink.getAttribute("href")).not.toMatch(/^mailto:/);
  });
});
