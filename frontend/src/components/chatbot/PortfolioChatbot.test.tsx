/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PortfolioChatbot } from "./PortfolioChatbot";
import { MemoryRouter } from "react-router";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

describe("PortfolioChatbot", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.location.hash = "";
    vi.clearAllMocks();
  });

  it("renders the floating action button", () => {
    render(
      <MemoryRouter>
        <PortfolioChatbot />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Chat with my resume")).toBeInTheDocument();
  });

  it("opens the chatbot when FAB is clicked", async () => {
    render(
      <MemoryRouter>
        <PortfolioChatbot />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Chat with my resume"));

    await waitFor(() => {
      expect(screen.getByText("Sean's Resume AI")).toBeInTheDocument();
    });
  });

  it("opens the chatbot when URL hash is #chat", async () => {
    window.location.hash = "#chat";

    render(
      <MemoryRouter>
        <PortfolioChatbot />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Sean's Resume AI")).toBeInTheDocument();
    });
  });

  it("persists open state in sessionStorage", async () => {
    render(
      <MemoryRouter>
        <PortfolioChatbot />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Chat with my resume"));

    await waitFor(() => {
      expect(sessionStorage.getItem("chatbot-open")).toBe("true");
    });
  });

  it("closes when the close button is clicked", async () => {
    render(
      <MemoryRouter>
        <PortfolioChatbot />
      </MemoryRouter>
    );

    // Open first
    fireEvent.click(screen.getByLabelText("Chat with my resume"));

    await waitFor(() => {
      expect(screen.getByText("Sean's Resume AI")).toBeInTheDocument();
    });

    // Close
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByText("Sean's Resume AI")).not.toBeInTheDocument();
    });

    expect(sessionStorage.getItem("chatbot-open")).toBeNull();
  });
});
