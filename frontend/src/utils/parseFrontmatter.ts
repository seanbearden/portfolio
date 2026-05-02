function safeJsonParse<T>(str: string): { success: true; data: T } | { success: false; error: unknown } {
  try {
    return { success: true, data: JSON.parse(str) };
  } catch (error) {
    return { success: false, error };
  }
}

export function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Remove surrounding quotes
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    // Parse JSON arrays
    if (val.startsWith("[")) {
      const parsed = safeJsonParse<string[]>(val);
      if (parsed.success) {
        meta[key] = parsed.data;
        continue;
      }
    }
    meta[key] = val;
  }
  return { meta, body: match[2].trim() };
}
