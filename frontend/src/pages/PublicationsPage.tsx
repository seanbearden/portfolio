import { getPublications } from "@/utils/content";
import { ExternalLink, FileText } from "lucide-react";

export function PublicationsPage() {
  const pubs = getPublications();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Publications</h1>
      <p className="mt-2 text-muted-foreground">
        Peer-reviewed research in computational physics, dynamical systems, and machine learning.
      </p>

      <div className="mt-8 space-y-6">
        {pubs.map((pub) => (
          <div key={pub.link} className="rounded-lg border p-5">
            <h2 className="font-semibold leading-snug">{pub.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pub.journal} &middot; {pub.year}
              {pub.type && ` · ${pub.type}`}
            </p>
            <div className="mt-3 flex gap-3">
              <a
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                <FileText className="h-3.5 w-3.5" /> Read Paper
              </a>
              {pub.preprint && (
                <a
                  href={pub.preprint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Preprint
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
