/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Mascot, type MascotState } from "./Mascot";
import * as FramerMotion from "framer-motion";

// Mock useReducedMotion. Default returns false (motion-on); individual
// tests can override via mockReturnValueOnce for the next render.
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
      const { getByTestId, queryAllByTestId } = render(<Mascot state={state} />);

      const core = getByTestId("mascot-core");
      const glow = getByTestId("mascot-glow");
      const features = getByTestId("mascot-features");
      const orbits = queryAllByTestId("mascot-orbits");

      if (state === "idle") {
        expect(core).toHaveClass("fill-primary");
        expect(glow).toHaveClass("bg-primary/20");
        expect(features).toHaveClass("text-primary-foreground");
      } else if (state === "thinking") {
        expect(core).toHaveClass("fill-primary");
        expect(glow).toHaveClass("bg-primary/30");
        expect(features).toHaveClass("text-primary-foreground");
      } else if (state === "error") {
        expect(core).toHaveClass("fill-destructive");
        expect(glow).toHaveClass("bg-destructive/20");
        expect(features).toHaveClass("text-destructive-foreground");
      } else if (state === "refusal") {
        expect(core).toHaveClass("fill-amber-500");
        expect(glow).toHaveClass("bg-amber-500/20");
        expect(features).toHaveClass("text-amber-50");
      }

      // Orbits group only renders with motion enabled — verify the inner
      // strokes carry the right tint regardless of state.
      orbits.forEach((group) => {
        group.querySelectorAll("circle[fill='none']").forEach((orbit) => {
          if (state === "idle") expect(orbit).toHaveClass("stroke-primary/30");
          else if (state === "thinking") expect(orbit).toHaveClass("stroke-primary/60");
          else if (state === "error") expect(orbit).toHaveClass("stroke-destructive/40");
          else if (state === "refusal") expect(orbit).toHaveClass("stroke-amber-500/40");
        });
      });
    });

    it(`matches snapshot for ${state} state`, () => {
      const { asFragment } = render(<Mascot state={state} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it(`renders correct features for ${state} state`, () => {
      const { container, getByTestId } = render(<Mascot state={state} />);
      const features = getByTestId("mascot-features");

      if (state === "idle") {
        // 2 eyes (circles with r=4) inside the features group; orbiting
        // nodes outside contribute additional r=4 circles in the
        // container scope.
        expect(features.querySelectorAll("circle[r='4']")).toHaveLength(2);
        expect(container.querySelector("path[d='M 45 60 Q 50 65 55 60']")).toBeInTheDocument();
      } else if (state === "thinking") {
        expect(features.querySelectorAll("circle[r='4']")).toHaveLength(2);
        expect(container.querySelector("path[d='M 35 35 Q 40 30 45 35']")).toBeInTheDocument();
        expect(container.querySelector("path[d='M 45 62 H 55']")).toBeInTheDocument();
      } else if (state === "error") {
        expect(features.querySelectorAll("path")).toHaveLength(2);
        expect(container.querySelector("path[d='M 43 65 Q 50 58 57 65']")).toBeInTheDocument();
      } else if (state === "refusal") {
        expect(features.querySelectorAll("rect")).toHaveLength(2);
        expect(container.querySelector("path[d='M 45 62 H 55']")).toBeInTheDocument();
      }
    });
  });

  it("applies contrast colors when contrast prop is true", () => {
    const { getByTestId, queryAllByTestId } = render(<Mascot contrast={true} />);

    expect(getByTestId("mascot-core")).toHaveClass("fill-primary-foreground");
    expect(getByTestId("mascot-glow")).toHaveClass("bg-primary-foreground/20");
    expect(getByTestId("mascot-features")).toHaveClass("text-primary");
    queryAllByTestId("mascot-orbits").forEach((g) => {
      g.querySelectorAll("circle[fill='none']").forEach((orbit) =>
        expect(orbit).toHaveClass("stroke-primary-foreground/40"),
      );
    });
  });

  it("respects reduced motion preferences", () => {
    // Override only this render — no manual reset needed afterward,
    // so a failed assertion can't leak into other tests.
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValueOnce(true);

    const { queryByTestId } = render(<Mascot />);

    // Orbits + orbiting nodes should not render when motion is reduced.
    expect(queryByTestId("mascot-orbits")).toBeNull();
    expect(queryByTestId("mascot-orbiting-node-1")).toBeNull();
    expect(queryByTestId("mascot-orbiting-node-2")).toBeNull();

    // Core body still renders.
    expect(queryByTestId("mascot-core")).toBeInTheDocument();
    expect(queryByTestId("mascot-features")).toBeInTheDocument();
  });

  it("uses transformOrigin instead of originX/originY for orbits", () => {
    const { getByTestId, queryByTestId } = render(<Mascot />);

    // Orbit ring strokes (children of mascot-orbits) honor transformOrigin.
    const orbitsGroup = getByTestId("mascot-orbits");
    orbitsGroup.querySelectorAll("circle[fill='none']").forEach((orbit) => {
      expect(orbit).toHaveStyle({ transformOrigin: "50px 50px" });
    });

    // Both orbiting-node groups also honor transformOrigin.
    [queryByTestId("mascot-orbiting-node-1"), queryByTestId("mascot-orbiting-node-2")]
      .filter((n): n is HTMLElement => n !== null)
      .forEach((node) => expect(node).toHaveStyle({ transformOrigin: "50px 50px" }));
  });
});
