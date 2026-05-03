/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentObservability } from "./AgentObservability";

describe("AgentObservability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the GenAI semconv explainer copy with a link to the spec", () => {
    render(<AgentObservability />);
    expect(screen.getByText(/Agent Observability/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /GenAI semantic conventions/i });
    expect(link).toHaveAttribute(
      "href",
      "https://opentelemetry.io/docs/specs/semconv/gen-ai/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows a placeholder when VITE_OBSERVABILITY_DASHBOARD_URL is unset", () => {
    vi.stubEnv("VITE_OBSERVABILITY_DASHBOARD_URL", "");
    render(<AgentObservability />);

    // Placeholder copy mentions the env var so future-you (or a contributor)
    // knows how to wire up a real dashboard.
    expect(
      screen.getByText(/VITE_OBSERVABILITY_DASHBOARD_URL/),
    ).toBeInTheDocument();

    // No iframe when the URL is unset.
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("renders an iframe pointing at the configured dashboard URL when set", () => {
    vi.stubEnv(
      "VITE_OBSERVABILITY_DASHBOARD_URL",
      "https://example.honeycomb.io/board/abcd",
    );
    // Re-import to pick up the stubbed env var (the module reads it at load).
    vi.resetModules();
    return import("./AgentObservability").then(({ AgentObservability: Reloaded }) => {
      render(<Reloaded />);

      const iframe = document.querySelector("iframe");
      expect(iframe).not.toBeNull();
      expect(iframe).toHaveAttribute(
        "src",
        "https://example.honeycomb.io/board/abcd",
      );
      expect(iframe).toHaveAttribute("title", "Agent observability dashboard");
      expect(iframe).toHaveAttribute("loading", "lazy");

      const openLink = screen.getByRole("link", { name: /Open in new tab/i });
      expect(openLink).toHaveAttribute(
        "href",
        "https://example.honeycomb.io/board/abcd",
      );
      expect(openLink).toHaveAttribute("target", "_blank");
      expect(openLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
