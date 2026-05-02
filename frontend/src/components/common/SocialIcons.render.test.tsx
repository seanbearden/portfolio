// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SocialIcon } from "./SocialIcons";

describe("SocialIcon Rendering", () => {
  it("renders the GitHub SVG", () => {
    const { container } = render(<SocialIcon platform="github" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the LinkedIn SVG", () => {
    const { container } = render(<SocialIcon platform="linkedin" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the Twitter SVG", () => {
    const { container } = render(<SocialIcon platform="twitter" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("returns null for unknown platform", () => {
    const { container } = render(<SocialIcon platform="unknown" />);
    expect(container.firstChild).toBeNull();
  });

  it("forwards SVG props (size, className)", () => {
    const { container } = render(<SocialIcon platform="github" className="w-4 h-4" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("w-4");
  });
});
