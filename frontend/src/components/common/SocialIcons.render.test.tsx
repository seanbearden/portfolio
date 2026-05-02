// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialIcon } from "./SocialIcons";

describe("SocialIcon (rendering)", () => {
  it("renders an SVG for github platform", () => {
    const { container } = render(<SocialIcon platform="github" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders nothing for unknown platform", () => {
    const { container } = render(<SocialIcon platform="myspace" />);
    expect(container.firstChild).toBeNull();
  });
});
