import { Link } from "react-router";
import { ArrowRight, Mail, MessageSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getHomeData,
  getProjects,
  getBlogPosts,
  assetUrl,
  pdfUrl,
  extractYouTubeId,
  youtubeThumbnail,
} from "@/utils/content";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const MotionCard = motion.create(Card);

export function HomePage() {
  const home = getHomeData();
  const projects = getProjects().slice(0, 3);
  const recentPosts = getBlogPosts().slice(0, 3);
  const shouldReduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = shouldReduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: "spring" as const, stiffness: 100, damping: 15 },
        },
      };

  return (
    <div className="relative mx-auto max-w-5xl px-4 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <motion.div
          className="flex flex-col items-center gap-8 md:flex-row md:gap-12 md:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.img
            variants={itemVariants}
            src={assetUrl("dr_bearden_celebration.webp")}
            alt="Sean Bearden"
            className="h-40 w-40 shrink-0 rounded-full object-cover ring-4 ring-border shadow-xl md:h-56 md:w-56"
            loading="eager"
            whileHover={shouldReduce ? undefined : { scale: 1.05 }}
            transition={shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
          />
          <div className="text-center md:text-left">
            <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              {home.hero.name}
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-4 text-xl text-muted-foreground/90 font-medium">
              {home.hero.headline}
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                to="/chat"
                className={cn(buttonVariants(), "shadow-lg hover:shadow-primary/20 transition-all duration-300")}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Chat with My Resume
              </Link>
              <Link to="/portfolio" className={cn(buttonVariants({ variant: "outline" }), "hover:bg-accent hover:text-accent-foreground transition-all duration-300")}>
                View Portfolio
              </Link>
              <a
                href={pdfUrl("Bearden_Resume_Online.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "hover:bg-accent hover:text-accent-foreground transition-all duration-300")}
              >
                Resume
              </a>
              <a
                href={pdfUrl("Bearden_CV.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "hover:bg-accent hover:text-accent-foreground transition-all duration-300")}
              >
                CV
              </a>
              <Link to="/contact" className={cn(buttonVariants({ variant: "outline" }), "hover:bg-accent hover:text-accent-foreground transition-all duration-300")}>
                <Mail className="mr-2 h-4 w-4" /> Contact
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <SectionDivider variant="waves" className="opacity-50" />

      {/* Featured Projects */}
      <section className="py-12">
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Featured Projects</h2>
            <Link to="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
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
                  <div className="aspect-video bg-muted shrink-0 overflow-hidden">
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
                <CardContent className="p-5 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg leading-snug">{project.title}</h3>
                  {project.subtitle && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {project.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5 bg-secondary/50 hover:bg-secondary transition-colors">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {project.link && project.cta && (
                    <div className="mt-auto pt-5">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 group transition-colors"
                      >
                        {project.cta} <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </MotionCard>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionDivider variant="network" className="opacity-50" />

      {/* Recent Posts */}
      <section className="py-12">
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Posts</h2>
            <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={shouldReduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
                whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: shouldReduce ? 0 : i * 0.1 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-border bg-card/30 p-5 transition-all duration-300 hover:bg-muted/50 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.body.slice(0, 150)}...
                      </p>
                    </div>
                    <time className="shrink-0 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full whitespace-nowrap">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionDivider variant="particles" className="opacity-50" />

      {/* About Preview */}
      <section className="py-16">
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border bg-card/30 p-8 md:p-12 text-center backdrop-blur-sm"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-6">About Me</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {home.about}
          </p>
          <Link to="/about" className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-8 group shadow-lg hover:shadow-primary/25 transition-all duration-300")}>
            Read full background <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
