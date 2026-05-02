// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicationsPage } from "./PublicationsPage";

vi.mock("@/utils/content", () => ({
  getPublications: () => [
    {
      title: "Test Publication",
      journal: "Test Journal",
      year: "2024",
      link: "https://example.com/pub",
      type: "Journal Article",
    },
  ],
}));

describe("PublicationsPage", () => {
  it("renders publication details", () => {
    render(<PublicationsPage />);
    expect(screen.getByText("Test Publication")).toBeInTheDocument();
    expect(screen.getByText(/Test Journal/i)).toBeInTheDocument();
    expect(screen.getByText(/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Journal Article/i)).toBeInTheDocument();
  });
});
