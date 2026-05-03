import { BrowserRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { PublicationsPage } from "@/pages/PublicationsPage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="publications" element={<PublicationsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}
