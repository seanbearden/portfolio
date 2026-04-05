import { Link, NavLink } from "react-router";
import { GitHubIcon, LinkedInIcon, XTwitterIcon } from "@/components/common/SocialIcons";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/blog", label: "Blog" },
  { to: "/publications", label: "Publications" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Sean Bearden
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-foreground ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://github.com/seanbearden" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GitHubIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </a>
          <a href="https://www.linkedin.com/in/sean-bearden-730aa189/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <LinkedInIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </a>
          <a href="https://twitter.com/Dr_Bearden" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <XTwitterIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </a>
        </div>
      </div>
    </header>
  );
}
