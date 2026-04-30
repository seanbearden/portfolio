import { Link } from "react-router";
import { ArrowRight, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHomeData, getProjects, getBlogPosts, assetUrl, pdfUrl } from "@/utils/content";
import { cn } from "@/lib/utils";

export function HomePage() {
  const home = getHomeData();
  const projects = getProjects().slice(0, 3);
  const recentPosts = getBlogPosts().slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-16 md:py-20">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12 md:text-left">
          <img
            src={assetUrl("dr_bearden_celebration.webp")}
            alt="Sean Bearden"
            className="h-40 w-40 shrink-0 rounded-full object-cover ring-4 ring-border md:h-56 md:w-56"
            loading="eager"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {home.hero.name}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              {home.hero.headline}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link to="/portfolio" className={cn(buttonVariants())}>
                View Portfolio
              </Link>
              <a
                href={pdfUrl("Bearden_Resume_Online.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Resume
              </a>
              <Link to="/contact" className={cn(buttonVariants({ variant: "outline" }))}>
                <Mail className="mr-2 h-4 w-4" /> Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.slug} className="overflow-hidden">
              {project.image && (
                <div className="aspect-video bg-muted">
                  <img
                    src={assetUrl(project.image)}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-medium leading-snug">{project.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {project.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {post.body.slice(0, 150)}...
                  </p>
                </div>
                <time className="shrink-0 text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-4">About</h2>
        <p className="text-muted-foreground leading-relaxed">{home.about}</p>
        <Link to="/about" className={cn(buttonVariants({ variant: "link" }), "mt-2 px-0")}>
          Read more about my background <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
