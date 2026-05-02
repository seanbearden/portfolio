import { Link, NavLink } from "react-router";
import { SocialIcon, hasSocialIcon } from "@/components/common/SocialIcons";
import { getHomeData } from "@/utils/content";
import { motion, useReducedMotion } from "framer-motion";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/blog", label: "Blog" },
  { to: "/publications", label: "Publications" },
  { to: "/contact", label: "Contact" },
];

const ariaLabels: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
};

export function Header() {
  const home = getHomeData();
  const shouldReduce = useReducedMotion();

  return (
    <motion.header
      initial={shouldReduce ? { opacity: 0 } : { y: -100 }}
      animate={shouldReduce ? { opacity: 1 } : { y: 0 }}
      transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
          Sean Bearden
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `relative text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && !shouldReduce && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && shouldReduce && (
                    <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {Object.entries(home.social).map(([platform, url]) => {
            if (!hasSocialIcon(platform)) return null;
            return (
              <motion.a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabels[platform] || platform}
                whileHover={shouldReduce ? undefined : { scale: 1.1, y: -2 }}
                whileTap={shouldReduce ? undefined : { scale: 0.95 }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SocialIcon platform={platform} className="h-5 w-5" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.header>
  );
}
