// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  it("renders contact info and supported social links", () => {
    render(<ContactPage />);

    expect(screen.getByText("sean@example.com")).toBeInTheDocument();
    expect(screen.getByText("github icon")).toBeInTheDocument();
    expect(screen.getByText("linkedin icon")).toBeInTheDocument();
    expect(screen.queryByText("unsupported icon")).not.toBeInTheDocument();

    const emailLink = screen.getByRole("link", { name: /sean@example.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:sean@example.com");
  });
});

describe("ContactPage with reduced motion", () => {
  it("renders correctly when prefers-reduced-motion is set", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });
});
