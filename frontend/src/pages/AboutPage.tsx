import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionDivider } from "@/components/ui/section-divider";
import { buttonVariants } from "@/components/ui/button";
import { AboutSynthesisIllustration } from "@/components/illustrations/AboutSynthesisIllustration";
import { getHomeData, pdfUrl } from "@/utils/content";
import { Award, Briefcase, GraduationCap, Download, Heart, Newspaper, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { EvalSuite } from "@/components/EvalSuite";
import { AgentObservability } from "@/components/AgentObservability";

export function AboutPage() {
  const home = getHomeData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_250px] items-start">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {home.bio.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="relative flex justify-center md:justify-end text-primary">
          <AboutSynthesisIllustration className="w-full max-w-[250px]" />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={pdfUrl("Bearden_Resume_Online.pdf")}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Download className="mr-2 h-4 w-4" /> Resume
        </a>
        <a
          href={pdfUrl("Bearden_CV.pdf")}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Download className="mr-2 h-4 w-4" /> CV
        </a>
        <a
          href={pdfUrl("DissertationSynopsis.pdf")}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Download className="mr-2 h-4 w-4" /> Dissertation Synopsis
        </a>
      </div>

      <SectionDivider variant="lines" className="my-4 opacity-50" />

      {/* LLM Evaluation Suite */}
      <EvalSuite />

      <SectionDivider variant="lines" className="my-4 opacity-50" />

      {/* Agent Observability — OpenTelemetry GenAI traces */}
      <AgentObservability />

      <SectionDivider variant="lines" className="my-4 opacity-50" />

      {/* Experience */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
          <Briefcase className="h-5 w-5" /> Experience
        </h2>
        <div className="space-y-6">
          {home.experience.map((exp) => (
            <Card key={exp.company}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{exp.role}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {exp.company} &middot; {exp.period}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {exp.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <SectionDivider variant="dots" className="my-4 opacity-50" />

      {/* Education */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
          <GraduationCap className="h-5 w-5" /> Education
        </h2>
        <div className="space-y-4">
          {home.education.map((edu) => (
            <div key={edu.degree} className="flex justify-between items-baseline">
              <div>
                <p className="font-medium">{edu.degree}</p>
                <p className="text-sm text-muted-foreground">{edu.school}</p>
              </div>
              <span className="text-sm text-muted-foreground">{edu.year}</span>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider variant="network" className="my-4 opacity-50" />

      {/* Awards */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
          <Award className="h-5 w-5" /> Awards
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {home.awards.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <SectionDivider variant="waves" className="my-4 opacity-50" />

      {/* Press & Media */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
          <Newspaper className="h-5 w-5" /> Press & Media
        </h2>
        <ul className="space-y-3">
          {home.press.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.source} &middot; {item.date}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 mt-1 text-muted-foreground transition-colors group-hover:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <SectionDivider variant="particles" className="my-4 opacity-50" />

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(home.skills).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider variant="dots" className="my-4 opacity-50" />

      {/* Beyond Work */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
          <Heart className="h-5 w-5" /> Beyond Work
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {home.interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
