import { describe, it, expect, beforeEach, vi } from "vitest";

// VITE_ASSETS_BASE_URL is read once at module load via import.meta.env.
// vi.stubEnv lets us override it before each test.
describe("assetUrl / pdfUrl", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_ASSETS_BASE_URL", "https://storage.googleapis.com/seanbearden-assets");
  });

  it("assetUrl prepends the assets base URL for bare filenames", async () => {
    const { assetUrl } = await import("./content");
    expect(assetUrl("photo.jpg")).toBe("https://storage.googleapis.com/seanbearden-assets/images/photo.jpg");
  });

  it("assetUrl returns external URLs unchanged", async () => {
    const { assetUrl } = await import("./content");
    expect(assetUrl("https://example.com/img.png")).toBe("https://example.com/img.png");
    expect(assetUrl("http://example.com/img.png")).toBe("http://example.com/img.png");
  });

  it("assetUrl returns empty string for empty input", async () => {
    const { assetUrl } = await import("./content");
    expect(assetUrl("")).toBe("");
  });

  it("pdfUrl prepends the pdfs path", async () => {
    const { pdfUrl } = await import("./content");
    expect(pdfUrl("resume.pdf")).toBe("https://storage.googleapis.com/seanbearden-assets/pdfs/resume.pdf");
  });
});
