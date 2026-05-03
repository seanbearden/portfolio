import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { ChatAgent } from "@/components/agent/ChatAgent";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatAgent embedded />
  </StrictMode>
);
