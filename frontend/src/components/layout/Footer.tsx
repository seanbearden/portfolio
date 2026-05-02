import { getHomeData, pdfUrl } from "@/utils/content";

export function Footer() {
  const home = getHomeData();

  return (
    <footer className="border-t py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 flex flex-col items-center gap-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Sean Bearden, Ph.D.</p>
        <div className="flex gap-4">
          <a href={pdfUrl("Bearden_Resume_Online.pdf")} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Resume
          </a>
          <a href={`mailto:${home.hero.email}`} className="hover:text-foreground transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
