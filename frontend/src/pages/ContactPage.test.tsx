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
    },
  }),
}));

vi.mock("@/components/common/SocialIcons", () => ({
  SocialIcon: ({ platform }: { platform: string }) => <span>{platform} icon</span>,
  hasSocialIcon: () => true,
}));

describe("ContactPage", () => {
  it("renders contact info and social links", () => {
    render(<ContactPage />);

    expect(screen.getByText("sean@example.com")).toBeInTheDocument();
    expect(screen.getByText("github icon")).toBeInTheDocument();
    expect(screen.getByText("linkedin icon")).toBeInTheDocument();

    const emailLink = screen.getByRole("link", { name: /sean@example.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:sean@example.com");
  });
});
