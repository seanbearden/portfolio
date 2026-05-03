import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getProjects,
  assetUrl,
  extractYouTubeId,
  youtubeThumbnail,
} from "@/utils/content";
import { ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ctaAnchorProps } from "@/utils/cta";

const MotionCard = motion.create(Card);

export function PortfolioPage() {
  const projects = getProjects();
  const shouldReduce = useReducedMotion();

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-16 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[0%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
      </div>

      <motion.div
        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -20 }}
        animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Portfolio</h1>
        <p className="mt-3 text-lg text-muted-foreground/90">
          Selected projects spanning data science, physics research, and AI applications.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {projects.map((project, i) => (
          <MotionCard
            key={project.slug}
            className="overflow-hidden flex flex-col border-border bg-card/50 backdrop-blur-sm transition-all"
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
            whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: shouldReduce ? 0 : i * 0.1 }}
            whileHover={shouldReduce ? undefined : { y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
          >
            {(project.image || extractYouTubeId(project.link)) && (
              <div className="aspect-video bg-muted overflow-hidden shrink-0">
                <motion.img
                  src={
                    project.image
                      ? assetUrl(project.image)
                      : youtubeThumbnail(extractYouTubeId(project.link)!)
                  }
                  alt={project.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  whileHover={shouldReduce ? undefined : { scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
            <CardContent className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-semibold leading-snug">{project.title}</h2>
              {project.subtitle && (
                <p className="mt-2 text-sm text-primary font-medium">
                  {project.subtitle}
                </p>
              )}
              <p className="mt-4 text-sm text-muted-foreground flex-1 leading-relaxed">
                {project.body.slice(0, 200)}
                {project.body.length > 200 ? "..." : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs bg-secondary/50 hover:bg-secondary transition-colors">
                    {skill}
                  </Badge>
                ))}
              </div>
              {project.link && (
                <div className="mt-auto pt-6">
                  <a
                    {...ctaAnchorProps(project.link)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 group transition-colors"
                  >
                    {project.cta || "View Project"} <ExternalLink className="h-4 w-4 transform group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              )}
            </CardContent>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
