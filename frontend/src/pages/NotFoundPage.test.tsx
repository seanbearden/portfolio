// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { NotFoundPage } from "./NotFoundPage";
import * as redirects from "@/utils/redirects";

vi.mock("@/utils/redirects", () => ({
  resolveOldUrl: vi.fn(),
}));

describe("NotFoundPage", () => {
  it("renders 404 for unknown paths", () => {
    vi.mocked(redirects.resolveOldUrl).mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/This URL collapsed before observation/i)).toBeInTheDocument();
  });

  it("redirects for known old URLs", () => {
    vi.mocked(redirects.resolveOldUrl).mockReturnValue("/blog/new-slug");

    render(
      <MemoryRouter initialEntries={["/old-path"]}>
        <Routes>
          <Route path="/blog/new-slug" element={<div>Redirected Page</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Redirected Page")).toBeInTheDocument();
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });
});
