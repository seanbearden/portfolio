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

# Pre-computed lowercase keys for faster substring searches
IMAGE_MAP_LOWER = [(k.lower(), v) for k, v in IMAGE_MAP.items()]


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
    line_lower = image_line.lower()
    for key_lower, val in IMAGE_MAP_LOWER:
        if key_lower in line_lower:
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
            f"title: {json.dumps(title)}",
            f"date: {date}",
            f"slug: {slug}",
            f"oldUrl: {json.dumps(meta['url'])}",
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
            f"title: {json.dumps(title)}",
            f"slug: {slug}",
            f"order: {written + 1}",
            f"skills: {json.dumps(skills_list)}",
        ]
        if link:
            fm_lines.append(f"link: {json.dumps(link)}")
        if image:
            fm_lines.append(f"image: {image}")
        fm_lines.append("---")

        body = description
        if "\n".join(body_lines).strip():
            body += "\n\n" + "\n".join(body_lines).strip()

        # Phase 2: Consolidated Chatbot
        if slug == "resume-chatbot-harnessing-chatgpt-for-the-job-search":
            # Override link/cta for the new integrated agent
            # Re-build fm_lines to include cta and set link to #chat
            fm_lines = [
                "---",
                f"title: {json.dumps(title)}",
                f"slug: {slug}",
                f"order: {written + 1}",
                f"skills: {json.dumps(skills_list)}",
                'link: "#chat"',
                'cta: "Open Chat"',
            ]
            if image:
                fm_lines.append(f"image: {image}")
            fm_lines.append("---")

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
            "cta": {
                "text": "Chat with My Resume",
                "action": "chat",
            },
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
        "about": "Physicist turned data scientist. Ph.D. from UC San Diego in memcomputing — a non-quantum alternative computing paradigm. Now applying that research mindset to financial services, AI assistants, and platform engineering.",
        "bio": [
            "I earned my Ph.D. in Physics from UC San Diego under Dr. Massimiliano Di Ventra, designing dynamical-systems algorithms for constraint satisfaction problems. The work was published in Nature Scientific Reports, Communications Physics, and Physical Review Applied, and built an independent memcomputing implementation separate from MemComputing, Inc.",
            "My path here wasn't linear. I started with a GED while incarcerated, transferred from Ohio University to SUNY Buffalo for a B.S. in Physics and Applied Mathematics, then to UCSD for graduate work. The Story Collider podcast captured part of that story. I've talked about it more openly because the path I took shouldn't be unusual — it should be possible.",
            "Today I work as a data scientist across two companies under common ownership: Bayview Solutions LLC (debt portfolio management, COGS modeling, BigQuery analytics) and Cash Lane Holdings (consumer lending, LangGraph-powered AI assistants on Google Cloud). I'm also Product Owner for an enterprise platform migration at BV-Tech-Solutions. The work spans ETL pipelines, RAG systems, conversational AI, and forecasting — building things that actually run in production.",
        ],
        "interests": [
            "Brazilian Jiu-Jitsu at P5 Academy in San Diego",
            "Arduino and Raspberry Pi projects (the talking Deadpool head was a personal favorite)",
            "Buffalo, NY native — and yes, a connoisseur of chicken wings",
            "Storytelling and public speaking, including a Story Collider appearance",
            "Lifelong learner — currently into LLM agent architectures and Kaggle competitions",
        ],
        "press": [
            {
                "title": "Q&A: Sean Bearden on his journey from prison to a Ph.D. in physics",
                "source": "Physics Today",
                "date": "2020-05",
                "url": "https://physicstoday.scitation.org/do/10.1063/PT.6.4.20200501a/full/",
            },
            {
                "title": "A Whole New World — Stories About Taking On the Challenge of a Whole New Existence",
                "source": "The Story Collider",
                "date": "2020-02",
                "url": "https://www.storycollider.org/stories/2020/2/18/a-whole-new-world-stories-about-having-to-take-on-the-challenge-of-a-whole-new-existence",
            },
            {
                "title": "Leading through education",
                "source": "Ohio Today",
                "date": "2016-03",
                "url": "https://www.ohio.edu/news/2016/03/leading-through-education",
            },
            {
                "title": "Sean Bearden's redemption road",
                "source": "UB Reporter",
                "date": "2015-06",
                "url": "https://www.buffalo.edu/fellowships/start/our-scholars.host.html/content/shared/university/news/ub-reporter-articles/stories/2015/06/bearden_nsf_grad_fellowship.detail.html",
            },
            {
                "title": "Prison adds up to physics career for math whiz Sean Bearden",
                "source": "The Buffalo News",
                "date": "2015-06",
                "url": "https://buffalonews.com/2015/06/21/prison-adds-up-to-physics-career-for-math-whiz-sean-bearden/",
            },
            {
                "title": "UB's outstanding seniors receive awards from the College of Arts and Sciences",
                "source": "The Spectrum",
                "date": "2015-05",
                "url": "https://www.ubspectrum.com/article/2015/05/ubs-outstanding-seniors-receive-awards-from-the-college-of-arts-and-sciences",
            },
            {
                "title": "Two UB students win highly competitive Goldwater Scholarships",
                "source": "UB News",
                "date": "2014-03",
                "url": "https://www.buffalo.edu/news/releases/2014/03/048.html",
            },
        ],
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
