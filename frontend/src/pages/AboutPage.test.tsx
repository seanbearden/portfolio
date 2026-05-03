// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutPage } from "./AboutPage";

vi.mock("@/utils/content", () => ({
  extractYouTubeId: () => null,
  youtubeThumbnail: (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  getHomeData: () => ({
    bio: ["Paragraph one.", "Paragraph two."],
    experience: [
      {
        company: "Test Co",
        role: "Dev",
        period: "2020-2022",
        highlights: ["Did stuff", "More stuff"],
      },
    ],
    education: [
      {
        degree: "PhD Physics",
        school: "Test University",
        year: "2020",
      },
    ],
    awards: ["Award 1"],
    press: [
      {
        title: "News Title",
        source: "News Source",
        date: "2023-01-01",
        url: "https://news.com",
      },
    ],
    skills: {
      "Data Science": ["Python", "ML"],
    },
    interests: ["BJJ", "Reading"],
  }),
  pdfUrl: (f: string) => `https://cdn.example.com/pdfs/${f}`,
  assetUrl: (f: string) => `https://cdn.example.com/images/${f}`,
  fetchLatestEval: async () => ({
    date: "2024-03-20",
    metrics: {
      hallucination_rate: 0.05,
      retrieval_precision: 0.95,
      refusal_correctness: 1.0,
      citation_validity: 0.9,
      latency_p50: 1.2,
      latency_p95: 1.8,
      avg_cost: 0.005,
    },
  }),
  fetchEvalHistory: async () => [],
}));

describe("AboutPage", () => {
  it("renders bio paragraphs", () => {
    render(<AboutPage />);
    expect(screen.getByText("Paragraph one.")).toBeInTheDocument();
    expect(screen.getByText("Paragraph two.")).toBeInTheDocument();
  });

  it("renders experience section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Co/i)).toBeInTheDocument();
    expect(screen.getByText(/Dev/i)).toBeInTheDocument();
    expect(screen.getByText("Did stuff")).toBeInTheDocument();
  });

  it("renders education section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Education/i)).toBeInTheDocument();
    expect(screen.getByText("PhD Physics")).toBeInTheDocument();
    expect(screen.getByText("Test University")).toBeInTheDocument();
  });

  it("renders awards section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Awards/i)).toBeInTheDocument();
    expect(screen.getByText("Award 1")).toBeInTheDocument();
  });

  it("renders press section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Press & Media/i)).toBeInTheDocument();
    expect(screen.getByText("News Title")).toBeInTheDocument();
    expect(screen.getByText(/News Source/i)).toBeInTheDocument();
  });

  it("renders skills section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Skills/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Science/i)).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("renders interests section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Beyond Work/i)).toBeInTheDocument();
    expect(screen.getByText("BJJ")).toBeInTheDocument();
  });
});
