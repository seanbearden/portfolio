import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";

const BLOG_DIR = path.resolve(process.cwd(), "../content/blog");
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const OG_DIR = path.resolve(PUBLIC_DIR, "og");
// Local cache for the downloaded font. The cache dir is gitignored
// (.gitignore: scripts/fonts/) so we don't commit a binary blob; the
// download runs once per fresh checkout / CI runner.
const FONT_CACHE_DIR = path.resolve(process.cwd(), "scripts", "fonts");
const FONT_CACHE_PATH = path.resolve(FONT_CACHE_DIR, "inter-400.ttf");
// Inter Regular from the @fontsource mirror on jsdelivr — same files
// distributed via the @fontsource/inter npm package, but accessible
// without adding a dev dependency.
const FONT_URL =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.ttf";

// Colors from index.css (approximate hex)
const COLORS = {
  background: "#121212", // oklch(0.145 0 0)
  foreground: "#fbfbfb", // oklch(0.985 0 0)
  primary: "#ebebeb",    // oklch(0.922 0 0)
  muted: "#b0b0b0",     // oklch(0.708 0 0)
};

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Font download failed: HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", (err) => {
        try { fs.unlinkSync(dest); } catch {}
        reject(err);
      });
  });
}

async function loadFont(): Promise<Buffer> {
  if (!fs.existsSync(FONT_CACHE_DIR)) {
    fs.mkdirSync(FONT_CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(FONT_CACHE_PATH)) {
    console.log(`Downloading Inter font from ${FONT_URL} ...`);
    await downloadFile(FONT_URL, FONT_CACHE_PATH);
    console.log(`Cached at ${FONT_CACHE_PATH}`);
  }
  return fs.readFileSync(FONT_CACHE_PATH);
}

async function generate() {
  if (!fs.existsSync(OG_DIR)) {
    fs.mkdirSync(OG_DIR, { recursive: true });
  }

  let fontData: Buffer;
  try {
    fontData = await loadFont();
  } catch (e) {
    console.error("Error loading font:", e);
    return;
  }

  const baseLayout = (title: string, subtitle?: string) => ({
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
        backgroundImage: "radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)",
        color: COLORS.foreground,
        padding: "40px 80px",
        textAlign: "center",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "60px",
              width: "100%",
              height: "100%",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: subtitle ? "60px" : "80px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    lineHeight: 1.2,
                  },
                  children: title,
                },
              },
              subtitle && {
                type: "div",
                props: {
                  style: {
                    fontSize: "30px",
                    color: COLORS.muted,
                    marginTop: "10px",
                  },
                  children: subtitle,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    bottom: "40px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    color: COLORS.primary,
                    textTransform: "uppercase",
                  },
                  children: "Sean Bearden, Ph.D.",
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  });

  async function saveOg(element: any, filename: string) {
    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    });

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    fs.writeFileSync(filename, pngBuffer);
    console.log(`Generated OG image: ${path.basename(filename).replace(/\n|\r/g, "")}`);
  }

  // 1. Generate Main OG
  await saveOg(
    baseLayout("Sean Bearden, Ph.D.", "Data Scientist & Researcher"),
    path.resolve(PUBLIC_DIR, "og-main.png")
  );

  // 2. Generate Blog OG images
  const files = fs.readdirSync(BLOG_DIR);
  for (const file of files) {
    if (file.endsWith(".md")) {
      const content = fs.readFileSync(path.resolve(BLOG_DIR, file), "utf-8");
      // Use a more robust way to handle nested quotes in titles that break gray-matter/js-yaml
      let data;
      try {
        data = matter(content).data;
      } catch (e) {
        // Simple fallback parser for the title and slug if gray-matter fails
        const titleMatch = content.match(/title:\s*"(.*)"/);
        const slugMatch = content.match(/slug:\s*(.*)/);
        data = {
          title: titleMatch ? titleMatch[1] : "Blog Post",
          slug: slugMatch ? slugMatch[1].trim() : file.replace(".md", ""),
        };
      }
      const rawSlug = data.slug || file.replace(".md", "");
      // Basic slug sanitization
      const slug = rawSlug.replace(/[^a-z0-9-]/gi, "");
      const title = data.title || "Blog Post";

      await saveOg(
        baseLayout(title, "seanbearden.com/blog"),
        path.resolve(OG_DIR, `blog-${slug}.png`)
      );
    }
  }
}

generate().catch(console.error);
