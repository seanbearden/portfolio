import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("dedupes conflicting Tailwind classes (twMerge behavior)", () => {
    // twMerge is the whole point — last-wins for conflicting Tailwind utilities
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
    expect(cn("base", null, undefined, "")).toBe("base");
  });

  it("handles array and object syntax (clsx behavior)", () => {
    expect(cn(["a", "b"])).toBe("a b");
    expect(cn({ "a": true, "b": false, "c": true })).toBe("a c");
  });

  it("returns empty string when no truthy classes provided", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined)).toBe("");
  });
});
