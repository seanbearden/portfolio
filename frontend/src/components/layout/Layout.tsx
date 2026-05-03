import { Outlet } from "react-router";
import { MotionConfig } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
