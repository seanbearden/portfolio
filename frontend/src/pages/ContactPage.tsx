import { useState } from "react";
import { getHomeData } from "@/utils/content";
import { buttonVariants } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { SocialIcon, hasSocialIcon } from "@/components/common/SocialIcons";
import { cn } from "@/lib/utils";

export function ContactPage() {
  const home = getHomeData();
  const [copied, setCopied] = useState(false);

  // mailto: links silently fail for users whose browser/OS has no default
  // mail client configured. Copy the address to the clipboard on every click
  // so SOMETHING visible happens, even if mailto: doesn't open a mail app.
  // We don't preventDefault — the browser still attempts mailto: navigation
  // for users who DO have a mail client.
  const handleEmailClick = () => {
    navigator.clipboard?.writeText(home.hero.email).catch(() => {
      /* clipboard may be unavailable in insecure contexts; ignore */
    });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Get in Touch</h1>
      <p className="mt-4 text-muted-foreground">
        Find me on LinkedIn or reach out via email.
      </p>

      <a
        href={`mailto:${home.hero.email}`}
        onClick={handleEmailClick}
        aria-label={`Email ${home.hero.email}`}
        className={cn(buttonVariants({ size: "lg" }), "mt-8")}
      >
        <Mail className="mr-2 h-5 w-5" />
        {copied ? "Copied!" : home.hero.email}
      </a>
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {copied ? "Email copied to clipboard." : "Click the address to copy or open your mail app."}
      </p>

      <div className="mt-10 flex justify-center gap-4">
        {Object.entries(home.social).map(([platform, url]) => {
          if (!hasSocialIcon(platform)) return null;
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border transition-colors hover:bg-muted"
              aria-label={platform}
            >
              <SocialIcon platform={platform} className="h-5 w-5" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
