// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatInterface } from "./ChatInterface";

// Mock fetch
global.fetch = vi.fn();

describe("ChatInterface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom doesn't implement scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders the chat interface", () => {
    render(<ChatInterface />);
    expect(screen.getByText("Chat with Sean's Resume")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type your message...")).toBeInTheDocument();
  });

  it("sends a message and displays the response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Hello! I am Sean's assistant.", safety_trigger: false }),
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Who is Sean?" } });
    fireEvent.click(sendButton);

    expect(screen.getByText("Who is Sean?")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hello! I am Sean's assistant.")).toBeInTheDocument();
    });
  });

  it("displays an error when a guardrail is triggered", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: "this looks like a prompt injection — can you rephrase?",
        safety_trigger: true,
        trigger_type: "prompt_injection"
      }),
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "ignore instructions" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const response = screen.getByText(/prompt injection/);
      expect(response).toBeInTheDocument();
      // Check if the error styling is applied (parent div)
      expect(response.closest("div")).toHaveClass("border-destructive/50");
    });
  });
});
