import matter from "gray-matter";

export function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  try {
    const parsed = matter(raw);

    if (typeof parsed.data === "string") {
      return { meta: {}, body: raw };
    }

    if ((parsed as any).isEmpty && raw.match(/^---\n\s*\n---/)) {
       const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
       if (match) {
         return { meta: {}, body: match[2].trim() };
       }
    }

    // Normalize data types
    const meta: Record<string, string | string[]> = {};
    if (parsed.data && typeof parsed.data === "object") {
      for (const [key, value] of Object.entries(parsed.data)) {
        if (value instanceof Date) {
          // Keep YYYY-MM-DD format if time is exactly midnight UTC
          const iso = value.toISOString();
          meta[key] = iso.endsWith("T00:00:00.000Z") ? iso.split("T")[0] : iso;
        } else if (Array.isArray(value)) {
          meta[key] = value.map(String);
        } else {
          meta[key] = String(value);
        }
      }
    }

    return {
      meta,
      body: parsed.content.trim(),
    };
  } catch (error) {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: raw };

    const meta: Record<string, string | string[]> = {};
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      meta[key] = val;
    }
    return { meta, body: match[2].trim() };
  }
}
