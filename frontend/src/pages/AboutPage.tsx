import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { getHomeData, pdfUrl } from "@/utils/content";
import { Award, Briefcase, GraduationCap, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutPage() {
  const home = getHomeData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">{home.about}</p>

      <div className="mt-4 flex gap-3">
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

      <Separator className="my-10" />

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

      <Separator className="my-10" />

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

      <Separator className="my-10" />

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

      <Separator className="my-10" />

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
    </div>
  );
}
