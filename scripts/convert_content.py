"""Convert site-data/ into structured content/ files for the frontend build."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_DATA = ROOT / "site-data"
CONTENT = ROOT / "content"

# Image filename mapping: descriptive names used in blog-posts.md → downloaded filenames
IMAGE_MAP = {
    "Updated_Modified_Image.jpg": "gcloud_next_24.webp",
    "IMG_2195.jpeg": "gcloud_next_24.webp",  # same post
    "processed-4E75FAF3": "future_of_work.jpg",
    "Screenshot 2024-02-16": "kaggle_notebook_expert.webp",
    "Screenshot 2024-02-14": "kaggle_discussions_expert.webp",
    "DALL": "home_credit_dalle.webp",
    "gold medal": "kaggle_gold_medal.webp",
    "Kaggle logo": "kaggle_logo.webp",
    "Sloan UCEM logo": "sloan_ucem_logo.webp",
    "circle_circuit.png": "memcomputing_circuit.png",
    "stockvault-teddy-bear": "dr_bearden_celebration.webp",
    "UC guidelines": "uc_fellowship.webp",
    "SASSY event": "sassy_san_diego.jpg",
    "Physics Today screenshot": "physics_today_qa.jpg",
    "Virtual Show flyer": "story_collider_virtual.jpg",
    "Social Skills promo": "story_collider_social_skills.png",
    "Sign-up screenshot": "triton_tutor.png",
    "image-asset.jpeg": "aps_2020.jpeg",
    "podcast ad": "story_collider_podcast_ad.jpg",
    "On stage at Hawaiian": "story_collider_on_stage.jpg",
    "UCSD SACNAS Team": "sacnas_team.jpg",
    "Receiving leis": "sacnas_leis.jpeg",
    "SACNAS booth": "sacnas_booth.jpeg",
    "Memcomputing Architecture": "darpa_memcomputing_arch.jpg",
    "Performance comparison": "darpa_performance_graph.jpg",
    "Program screenshot": None,  # generic, resolved per-post
    "Event screenshot": "nsf_proposal_talk.webp",
    "APS March Meeting calendar": "aps_2018.webp",
}


def slugify(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[''']", "", slug)
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def resolve_image(image_line: str, post_index: int) -> str | None:
    """Try to match an image reference to a downloaded filename."""
    if not image_line:
        return None
    for key, val in IMAGE_MAP.items():
        if key.lower() in image_line.lower():
            if val is not None:
                return val
    # Fallback mapping by post index for "Program screenshot" entries
    fallback = {
        20: "mini_mba.webp",    # Mini MBA
        21: "micro_mba.webp",   # Micro-MBA
        24: "ucsd_leadership.webp",  # Leadership program
    }
    return fallback.get(post_index)


def convert_blog_posts():
    """Split blog-posts.md into individual markdown files with frontmatter."""
    sitemap = json.loads((SITE_DATA / "sitemap.json").read_text())
    posts_meta = sitemap["blog_posts"]
    raw = (SITE_DATA / "blog-posts.md").read_text()

    # Pre-compute sets of words for fuzzy matching to improve performance
    fuzzy_meta = [
        (m, set(m["title"].lower().split()[:4]))
        for m in posts_meta
    ]

    # Split on --- separators between posts
    sections = re.split(r"\n---\n", raw)
    blog_dir = CONTENT / "blog"
    blog_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for section in sections:
        section = section.strip()
        if not section or section.startswith("# Blog Posts"):
            continue

        # Extract title from ## N. Title
        title_match = re.match(r"## \d+\.\s+(.+)", section)
        if not title_match:
            continue
        title = title_match.group(1).strip()
        title_lower = title.lower()

        # Find matching metadata from sitemap
        meta = None
        title_exact = title_lower[:30]
        for m in posts_meta:
            if m["title"].lower()[:30] == title_exact:
                meta = m
                break
        if not meta:
            # Fuzzy match
            title_words = set(title_lower.split()[:4])
            for m, meta_words in fuzzy_meta:
                if len(title_words & meta_words) >= 3:
                    meta = m
                    break

        if not meta:
            print(f"  WARN: No metadata match for: {title[:60]}")
            meta = {"date": "2020-01-01", "categories": [], "tags": [], "url": ""}

        # Extract body: everything after the header lines
        lines = section.split("\n")
        body_lines = []
        image_ref = None
        skip_header = True

        for line in lines[1:]:  # Skip title line
            if skip_header and line.startswith("**Date:**"):
                continue
            if skip_header and line.startswith("**Categories:**"):
                skip_header = False
                continue
            if line.startswith("**Image:**"):
                image_ref = line.replace("**Image:**", "").strip()
                continue
            if line.startswith("**Images:**"):
                image_ref = line.replace("**Images:**", "").strip()
                continue
            body_lines.append(line)

        body = "\n".join(body_lines).strip()

        # Resolve image
        image = resolve_image(image_ref, written)

        # Generate slug and filename
        slug = slugify(title)
        date = meta["date"]
        filename = f"{date}-{slug[:60]}.md"

        # Build frontmatter
        fm_lines = [
            "---",
            f'title: "{title}"',
            f"date: {date}",
            f"slug: {slug}",
            f"oldUrl: \"{meta['url']}\"",
        ]
        if meta["categories"]:
            cats = json.dumps(meta["categories"])
            fm_lines.append(f"categories: {cats}")
        if meta["tags"]:
            tags = json.dumps(meta["tags"])
            fm_lines.append(f"tags: {tags}")
        if image:
            fm_lines.append(f"image: {image}")
        fm_lines.append("---")

        content = "\n".join(fm_lines) + "\n\n" + body + "\n"
        (blog_dir / filename).write_text(content)
        written += 1

    print(f"  Blog: wrote {written} posts to content/blog/")


def convert_portfolio():
    """Split portfolio.md into individual project files."""
    raw = (SITE_DATA / "portfolio.md").read_text()
    portfolio_dir = CONTENT / "portfolio"
    portfolio_dir.mkdir(parents=True, exist_ok=True)

    # Image filename mapping for portfolio projects
    portfolio_images = {
        "Resume Chatbot": "lp_logo_3.0.webp",
        "UFC Investigation": "dana_gif.gif",
        "PhD Research Video": "phd_research_thumbnail.png",
        "Nature Publication": "factor_graph_fig_2.jpg",
        "Dissertation Synopsis": "dissertation_synopsis.png",
        "RBM Publication": "rbm_publication.png",
        "APS Conference": "circuit_aps.jpg",
        "Stochastic Resonance": "stochastic_resonance.png",
    }

    sections = re.split(r"\n## Project \d+:", raw)
    written = 0

    for section in sections:
        section = section.strip()
        if not section or section.startswith("# Portfolio"):
            continue

        lines = section.split("\n")
        title = ""
        description = ""
        skills = ""
        link = ""
        related_pub = ""
        body_lines = []

        for line in lines:
            if line.startswith("**Title:**"):
                title = line.replace("**Title:**", "").strip()
            elif line.startswith("**Description:**"):
                description = line.replace("**Description:**", "").strip()
            elif line.startswith("**Skills:**"):
                skills = line.replace("**Skills:**", "").strip()
            elif line.startswith("**Link:**"):
                link = line.replace("**Link:**", "").strip()
            elif line.startswith("**Related Publication:**"):
                related_pub = line.replace("**Related Publication:**", "").strip()
            elif not line.startswith("**Image:**"):
                body_lines.append(line)

        if not title:
            continue

        slug = slugify(title)
        image = None
        for key, val in portfolio_images.items():
            if key.lower() in title.lower():
                image = val
                break

        skills_list = [s.strip() for s in skills.split(",") if s.strip()]

        fm_lines = [
            "---",
            f'title: "{title}"',
            f"slug: {slug}",
            f"order: {written + 1}",
            f"skills: {json.dumps(skills_list)}",
        ]
        if link:
            fm_lines.append(f'link: "{link}"')
        if related_pub:
            fm_lines.append(f'relatedPublication: "{related_pub}"')
        if image:
            fm_lines.append(f"image: {image}")
        fm_lines.append("---")

        body = description
        if "\n".join(body_lines).strip():
            body += "\n\n" + "\n".join(body_lines).strip()

        content = "\n".join(fm_lines) + "\n\n" + body + "\n"
        filename = f"{written + 1:02d}-{slug[:50]}.md"
        (portfolio_dir / filename).write_text(content)
        written += 1

    print(f"  Portfolio: wrote {written} projects to content/portfolio/")


def convert_publications():
    """Convert publications.md to structured JSON."""
    raw = (SITE_DATA / "publications.md").read_text()
    pubs = []

    sections = re.split(r"\n## \d+\.", raw)
    for section in sections:
        section = section.strip()
        if not section or section.startswith("# Publications"):
            continue

        title = section.split("\n")[0].strip()
        journal = ""
        year = ""
        link = ""
        preprint = ""
        pub_type = ""

        for line in section.split("\n"):
            line = line.strip("- ").strip()
            if line.startswith("**Journal:**"):
                journal = line.replace("**Journal:**", "").strip()
            elif line.startswith("**Year:**"):
                year = line.replace("**Year:**", "").strip()
            elif line.startswith("**Type:**"):
                pub_type = line.replace("**Type:**", "").strip()
            elif line.startswith("**Link:**"):
                link = line.replace("**Link:**", "").strip()
            elif line.startswith("**Preprint:**"):
                preprint = line.replace("**Preprint:**", "").strip()

        if title:
            pub = {"title": title, "journal": journal, "year": year, "link": link}
            if preprint:
                pub["preprint"] = preprint
            if pub_type:
                pub["type"] = pub_type
            pubs.append(pub)

    out = CONTENT / "publications.json"
    out.write_text(json.dumps(pubs, indent=2) + "\n")
    print(f"  Publications: wrote {len(pubs)} entries to content/publications.json")


def convert_home():
    """Convert home.md to structured JSON for the homepage."""
    raw = (SITE_DATA / "home.md").read_text()

    home = {
        "hero": {
            "name": "Sean Bearden Ph.D.",
            "headline": "Data Scientist and Researcher",
            "email": "seanbearden@seanbearden.com",
        },
        "social": {
            "linkedin": "https://www.linkedin.com/in/sean-bearden-730aa189/",
            "twitter": "https://twitter.com/Dr_Bearden",
            "github": "https://github.com/seanbearden",
            "kaggle": "https://www.kaggle.com/seanbearden",
        },
        "experience": [
            {
                "company": "Valmar Holdings LLC",
                "role": "Data Scientist / Chief Analytics Officer",
                "period": "2020-2023",
                "highlights": [
                    "Underwriting systems design",
                    "Lead forecasting models",
                    "Fraud detection evaluation",
                ],
            },
            {
                "company": "UC San Diego",
                "role": "Graduate Researcher",
                "period": "2016-2020",
                "highlights": [
                    "Dynamical system optimization",
                    "Algorithm comparison studies",
                    "Neural network research",
                ],
            },
            {
                "company": "Wyzant",
                "role": "Private Tutor",
                "period": "2015-2019",
                "highlights": [
                    "Physics and mathematics instruction",
                    "Alternative learning styles focus",
                ],
            },
            {
                "company": "SUNY Buffalo",
                "role": "Student Researcher",
                "period": "2013-2015",
                "highlights": [
                    "Spin-laser simulation",
                    "Nonlinear dynamical systems",
                ],
            },
        ],
        "education": [
            {
                "degree": "Ph.D. Physics",
                "school": "UC San Diego",
                "year": "2020",
            },
            {
                "degree": "M.S. Physics",
                "school": "UC San Diego",
                "year": "2018",
            },
            {
                "degree": "B.S. Physics & Applied Mathematics",
                "school": "SUNY Buffalo",
                "year": "2015",
            },
            {
                "degree": "A.S. Natural Sciences",
                "school": "Ohio University",
                "year": "2011",
            },
        ],
        "awards": [
            "UC President's Dissertation Year Fellowship",
            "NSF Graduate Research Fellowship",
            "Alfred P. Sloan University Center Fellowship",
            "Barry Goldwater Scholarship",
            "UCSD Summer Research Fellowship",
        ],
        "skills": {
            "programming": ["MATLAB", "Python", "JavaScript"],
            "datascience": [
                "Machine Learning",
                "LLMs",
                "Forecasting",
                "scikit-learn",
                "LangChain",
            ],
            "cloud": ["Google Cloud Platform", "AWS"],
            "research": [
                "Dynamical Systems",
                "Optimization",
                "Computational Physics",
            ],
        },
        "about": "Sean Bearden earned his Ph.D. in Physics from UC San Diego as a member of Dr. Massimiliano Di Ventra's research group, focusing on constraint satisfaction problems using digital memcomputing machines. A nontraditional learner who began his academic journey while incarcerated, he went from a GED to a Ph.D. He is committed to lifelong learning, creative projects with Arduino and Raspberry Pi, and practices Brazilian Jiu-Jitsu in San Diego.",
    }

    out = CONTENT / "home.json"
    out.write_text(json.dumps(home, indent=2) + "\n")
    print(f"  Home: wrote structured data to content/home.json")


if __name__ == "__main__":
    CONTENT.mkdir(parents=True, exist_ok=True)
    print("Converting site-data/ → content/")
    convert_blog_posts()
    convert_portfolio()
    convert_publications()
    convert_home()
    print("Done.")
