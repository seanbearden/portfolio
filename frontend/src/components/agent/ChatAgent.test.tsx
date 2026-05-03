// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ChatAgent } from "./ChatAgent";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("ChatAgent", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // jsdom doesn't support scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders the floating bubble initially", () => {
    render(<ChatAgent />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(screen.queryByText("Portfolio Agent")).not.toBeInTheDocument();
  });

  it("opens the chat window when the bubble is clicked", async () => {
    render(<ChatAgent />);
    const bubble = screen.getByRole("button");
    fireEvent.click(bubble);
    await waitFor(() => {
      expect(screen.getByText("Portfolio Agent")).toBeInTheDocument();
    });
    expect(screen.getByText(/Hi! I'm Sean's portfolio agent/)).toBeInTheDocument();
  });

  it("sends a message and receives a response", async () => {
    render(<ChatAgent />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ask me anything...");
    fireEvent.change(input, { target: { value: "Hello" } });

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find(btn => btn.querySelector('.lucide-send'));

    expect(sendButton).toBeDefined();
    if (sendButton) {
        fireEvent.click(sendButton);
    }

    expect(screen.getByText("Hello")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.getByText(/Phase 2 will bring my full intelligence online/)).toBeInTheDocument();
    });
  });

  it("renders in embedded mode for iframes", async () => {
    render(<ChatAgent embedded />);
    // In embedded mode, it starts with a bubble if isOpen is false (default)
    expect(screen.queryByText("Portfolio Agent")).not.toBeInTheDocument();
    const bubble = screen.getByRole("button", { name: /open chat/i });
    expect(bubble).toBeInTheDocument();

    fireEvent.click(bubble);
    await waitFor(() => {
      expect(screen.getByText("Portfolio Agent")).toBeInTheDocument();
    });
  });
});
