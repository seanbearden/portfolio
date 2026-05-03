import { Outlet } from "react-router";
import { MotionConfig } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PortfolioChatbot } from "@/components/chatbot/PortfolioChatbot";

// Note: PR #186 introduced an `AgentPopup` placeholder (mascot UI + dev-mode
// state cycler, no real backend). PortfolioChatbot from this PR is the
// production integration that talks to /api/chat with SSE streaming. Keeping
// only PortfolioChatbot rendered. Follow-up: fold Mascot from
// `@/assets/Mascot` into PortfolioChatbot's header so the production widget
// reuses the mascot identity from #186.

export function Layout() {
  return (
<<<<<<< HEAD
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </MotionConfig>
=======
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PortfolioChatbot />
    </div>
>>>>>>> origin/main
  );
}
