/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Mascot, type MascotState } from "./Mascot";
import * as FramerMotion from "framer-motion";

// Mock useReducedMotion
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

describe("Mascot Component", () => {
  const states: MascotState[] = ["idle", "thinking", "error", "refusal"];

  describe.each(states)("State: %s", (state) => {
    it(`renders correct colors for ${state} state`, () => {
      const { container } = render(<Mascot state={state} />);

      const core = container.querySelector("circle[cx='50'][cy='50'][r='30']");
      const glow = container.firstChild?.firstChild;
      const orbits = container.querySelectorAll("circle[fill='none']");
      const features = container.querySelector("g[fill='currentColor']");

      if (state === "idle") {
        expect(core).toHaveClass("fill-primary");
        expect(glow).toHaveClass("bg-primary/20");
        orbits.forEach(orbit => expect(orbit).toHaveClass("stroke-primary/30"));
        expect(features).toHaveClass("text-primary-foreground");
      } else if (state === "thinking") {
        expect(core).toHaveClass("fill-primary");
        expect(glow).toHaveClass("bg-primary/30");
        orbits.forEach(orbit => expect(orbit).toHaveClass("stroke-primary/60"));
        expect(features).toHaveClass("text-primary-foreground");
      } else if (state === "error") {
        expect(core).toHaveClass("fill-destructive");
        expect(glow).toHaveClass("bg-destructive/20");
        orbits.forEach(orbit => expect(orbit).toHaveClass("stroke-destructive/40"));
        expect(features).toHaveClass("text-destructive-foreground");
      } else if (state === "refusal") {
        expect(core).toHaveClass("fill-amber-500");
        expect(glow).toHaveClass("bg-amber-500/20");
        orbits.forEach(orbit => expect(orbit).toHaveClass("stroke-amber-500/40"));
        expect(features).toHaveClass("text-amber-50");
      }
    });

    it(`matches snapshot for ${state} state`, () => {
      const { asFragment } = render(<Mascot state={state} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it(`renders correct features for ${state} state`, () => {
      const { container } = render(<Mascot state={state} />);

      if (state === "idle") {
        // 2 eyes (circles with r=4) + 1 orbiting node (circle with r=4)
        expect(container.querySelectorAll("circle[r='4']")).toHaveLength(3);
        // 1 mouth (path)
        expect(container.querySelector("path[d='M 45 60 Q 50 65 55 60']")).toBeInTheDocument();
      } else if (state === "thinking") {
        // 2 eyes (circles with r=4) + 1 orbiting node (circle with r=4)
        expect(container.querySelectorAll("circle[r='4']")).toHaveLength(3);
        expect(container.querySelector("path[d='M 35 35 Q 40 30 45 35']")).toBeInTheDocument();
        // thinking mouth
        expect(container.querySelector("path[d='M 45 62 H 55']")).toBeInTheDocument();
      } else if (state === "error") {
        // 4 paths for X eyes
        expect(container.querySelectorAll("g[fill='currentColor'] path")).toHaveLength(2);
        // 1 mouth path
        expect(container.querySelector("path[d='M 43 65 Q 50 58 57 65']")).toBeInTheDocument();
      } else if (state === "refusal") {
        // 2 rect eyes
        expect(container.querySelectorAll("rect")).toHaveLength(2);
        // 1 mouth path
        expect(container.querySelector("path[d='M 45 62 H 55']")).toBeInTheDocument();
      }
    });
  });

  it("applies contrast colors when contrast prop is true", () => {
    const { container } = render(<Mascot contrast={true} />);

    const core = container.querySelector("circle[cx='50'][cy='50'][r='30']");
    const glow = container.firstChild?.firstChild;
    const orbits = container.querySelectorAll("circle[fill='none']");
    const features = container.querySelector("g[fill='currentColor']");

    expect(core).toHaveClass("fill-primary-foreground");
    expect(glow).toHaveClass("bg-primary-foreground/20");
    orbits.forEach(orbit => expect(orbit).toHaveClass("stroke-primary-foreground/40"));
    expect(features).toHaveClass("text-primary");
  });

  it("respects reduced motion preferences", () => {
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

    const { container } = render(<Mascot />);

    // Orbits should not be rendered
    const orbits = container.querySelectorAll("circle[fill='none']");
    expect(orbits).toHaveLength(0);

    // Orbiting nodes should not be rendered
    // In normal mode, there are 2 orbiting nodes (circles with r=4 and r=3)
    // and the core circle (r=30) and 2 eyes (r=4).
    const allCircles = container.querySelectorAll("circle");
    // Core circle (r=30) + 2 eyes (r=4) should remain
    expect(allCircles).toHaveLength(3);
    const core = Array.from(allCircles).find(c => c.getAttribute("r") === "30");
    expect(core).toBeInTheDocument();

    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);
  });

  it("uses transformOrigin instead of originX/originY for orbits", () => {
    const { container } = render(<Mascot />);

    const orbits = container.querySelectorAll("circle[fill='none']");
    orbits.forEach(orbit => {
      // In JSDOM/Vitest, style might be represented differently,
      // but let's check for transformOrigin
      expect(orbit).toHaveStyle({ transformOrigin: "50px 50px" });
    });

    // Check orbiting nodes
    const orbitingNodes = container.querySelectorAll("g[style*='transform-origin']");
    orbitingNodes.forEach(node => {
        expect(node).toHaveStyle({ transformOrigin: "50px 50px" });
    });
  });
});
