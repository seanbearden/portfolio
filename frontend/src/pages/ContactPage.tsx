import { getHomeData } from "@/utils/content";
import { buttonVariants } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { SocialIcon, hasSocialIcon } from "@/components/common/SocialIcons";
import { cn } from "@/lib/utils";

export function ContactPage() {
  const home = getHomeData();

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Get in Touch</h1>
      <p className="mt-4 text-muted-foreground">
        Find me on LinkedIn or reach out via email.
      </p>

      <a
        href={`mailto:${home.hero.email}`}
        className={cn(buttonVariants({ size: "lg" }), "mt-8")}
      >
        <Mail className="mr-2 h-5 w-5" /> {home.hero.email}
      </a>

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
