import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjects, assetUrl } from "@/utils/content";
import { ExternalLink } from "lucide-react";

export function PortfolioPage() {
  const projects = getProjects();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
      <p className="mt-2 text-muted-foreground">
        Selected projects spanning data science, physics research, and AI applications.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.slug} className="overflow-hidden flex flex-col">
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
            <CardContent className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-semibold leading-snug">{project.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground flex-1">
                {project.body.slice(0, 200)}
                {project.body.length > 200 ? "..." : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  View Project <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
