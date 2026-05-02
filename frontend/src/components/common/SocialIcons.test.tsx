import { describe, it, expect } from "vitest";
import { hasSocialIcon } from "./SocialIcons";

describe("SocialIcons", () => {
  it("hasSocialIcon returns true for supported platforms", () => {
    expect(hasSocialIcon("github")).toBe(true);
    expect(hasSocialIcon("linkedin")).toBe(true);
    expect(hasSocialIcon("twitter")).toBe(true);
  });

  it("hasSocialIcon returns false for unsupported platforms", () => {
    expect(hasSocialIcon("unknown")).toBe(false);
  });
});
