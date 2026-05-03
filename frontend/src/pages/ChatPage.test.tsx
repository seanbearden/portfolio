// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { ChatPage } from "./ChatPage";
import { MemoryRouter } from "react-router";
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("ChatPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the chat page with initial assistant message", () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Chat with My Resume/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Hi! I'm Sean's virtual assistant/i)
    ).toBeInTheDocument();
  });

  it("shows the correct backend badge for Cloud Run", () => {
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <ChatPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Backend: Cloud Run/i)).toBeInTheDocument();
  });

  it("shows the correct backend badge for Agent Engine when ?backend=ae is present", () => {
    render(
      <MemoryRouter initialEntries={["/chat?backend=ae"]}>
        <ChatPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Backend: Vertex AI Agent Engine/i)).toBeInTheDocument();
  });
});
