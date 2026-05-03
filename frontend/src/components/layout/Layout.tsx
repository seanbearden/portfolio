import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AgentPopup } from "@/components/common/AgentPopup";

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AgentPopup />
    </div>
  );
}
