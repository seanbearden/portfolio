// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { Layout } from "./Layout";

afterEach(() => {
  cleanup();
});

vi.mock("@/utils/content", () => ({
  getHomeData: () => ({
    hero: {
      name: "Sean Bearden",
      headline: "Tester",
      email: "test@example.com",
    },
    social: {
      github: "https://github.com/test",
    },
  }),
  pdfUrl: (f: string) => `https://cdn.example.com/pdfs/${f}`,
}));

describe("Layout", () => {
  it("renders Header, Footer and Outlet content", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div data-testid="outlet-content">Main Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Check Header
    expect(screen.getByRole("banner")).toBeInTheDocument();
    // Use getAllByText for "Sean Bearden" since it appears in Header and Footer
    expect(screen.getAllByText(/Sean Bearden/i).length).toBeGreaterThanOrEqual(2);

    // Check Outlet content
    expect(screen.getByTestId("outlet-content")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();

    // Check Footer
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
