// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortfolioPage } from "./PortfolioPage";

vi.mock("@/utils/content", () => ({
  getProjects: () => [
    {
      title: "Portfolio Project",
      slug: "portfolio-project",
      body: "This is a detailed description of the project.",
      skills: ["React", "Vite"],
      link: "https://github.com/test/project",
    },
  ],
  assetUrl: (f: string) => `https://cdn.example.com/${f}`,
}));

describe("PortfolioPage", () => {
  it("renders project details", () => {
    render(<PortfolioPage />);
    expect(screen.getByText("Portfolio Project")).toBeInTheDocument();
    expect(screen.getByText(/detailed description/i)).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vite")).toBeInTheDocument();
    expect(screen.getByText(/View Project/i)).toBeInTheDocument();
  });
});
