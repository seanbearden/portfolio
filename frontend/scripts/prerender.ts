import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const BLOG_DIR = path.resolve(process.cwd(), "../content/blog");
const INDEX_HTML = path.resolve(DIST_DIR, "index.html");

// Mimic the logic from frontend/src/utils/seo.ts without needing tsx to handle aliases
function sanitizeDescription(text: string, length = 160): string {
  if (!text) return "";
  const plainText = text
    .replace(/[#*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plainText.length <= length) return plainText;
  return plainText.slice(0, length).trim() + "...";
}

const SEO_CONFIG = {
  siteUrl: "https://seanbearden.com",
};

async function prerender() {
  if (!fs.existsSync(INDEX_HTML)) {
    console.error("dist/index.html not found. Run npm run build first.");
    return;
  }

  const template = fs.readFileSync(INDEX_HTML, "utf-8");

  function injectMeta(html: string, tags: Record<string, string>) {
    let head = html.split("</head>")[0];
    const rest = html.split("</head>")[1];

    for (const [name, content] of Object.entries(tags)) {
      if (name.startsWith("og:") || name.startsWith("twitter:")) {
        head += `  <meta property="${name}" content="${content}">\n`;
      } else if (name === "title") {
        head = head.replace(/<title>.*<\/title>/, `<title>${content}</title>`);
        head += `  <meta name="title" content="${content}">\n`;
      } else {
        head += `  <meta name="${name}" content="${content}">\n`;
      }
    }

    return head + "</head>" + rest;
  }

  const { siteUrl } = SEO_CONFIG;

  const files = fs.readdirSync(BLOG_DIR);
  for (const file of files) {
    if (file.endsWith(".md")) {
      const content = fs.readFileSync(path.resolve(BLOG_DIR, file), "utf-8");

      let data;
      let body;
      try {
        const result = matter(content);
        data = result.data;
        body = result.content;
      } catch (e) {
        const titleMatch = content.match(/title:\s*"(.*)"/);
        const slugMatch = content.match(/slug:\s*(.*)/);
        data = {
          title: titleMatch ? titleMatch[1] : "Blog Post",
          slug: slugMatch ? slugMatch[1].trim() : file.replace(".md", ""),
        };
        body = content.split("---").pop() || "";
      }

      const slug = data.slug || file.replace(".md", "");
      const title = `${data.title} | Sean Bearden, Ph.D.`;
      const description = sanitizeDescription(body);
      const image = `${siteUrl}/og/blog-${slug}.png`;
      const url = `${siteUrl}/blog/${slug}`;

      const tags = {
        title,
        description,
        image,
        "og:title": title,
        "og:description": description,
        "og:image": image,
        "og:url": url,
        "og:type": "article",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": image,
      };

      const html = injectMeta(template, tags);
      const outputDir = path.resolve(DIST_DIR, "blog", slug);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(outputDir, "index.html"), html);
      console.log(`Prerendered blog/${slug}`);
    }
  }

  const mainTags = {
    "og:image": `${siteUrl}/og-main.png`,
    "twitter:image": `${siteUrl}/og-main.png`,
  };
  const mainHtml = injectMeta(template, mainTags);
  fs.writeFileSync(INDEX_HTML, mainHtml);
  console.log("Updated dist/index.html with main OG tags");
}

prerender().catch(console.error);
