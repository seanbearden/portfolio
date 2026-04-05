# Sean Bearden — Portfolio Website

Personal portfolio website for Sean Bearden, Ph.D. — migrating from Squarespace to Google Cloud.

## Project Status

**Phase 1: Data Extraction** — Complete. All content, images, and PDFs scraped from the existing Squarespace site at seanbearden.com.

## Repository Structure

```
site-data/
  sitemap.json            # Full URL map with metadata
  home.md                 # Hero, about, experience, education, awards, skills
  portfolio.md            # 8 portfolio projects with descriptions and links
  publications.md         # 6 peer-reviewed publications
  contact.md              # Contact info and social links
  blog-posts.md           # 25 blog posts (full content)
  images.md               # Asset inventory with source URLs
  external-links.md       # All outbound links and redirect map
  assets/
    pdfs/                 # Resume, dissertation synopsis, papers, slides (5 files)
    images/               # Photos, figures, logos, screenshots (37 files)
```

## Content Summary

- **Portfolio Projects:** 8 (resume chatbot, UFC analysis, PhD research video, publications, presentations)
- **Blog Posts:** 25 (2018–2024, covering data science, Kaggle, physics research, storytelling)
- **Publications:** 6 peer-reviewed (Nature Scientific Reports, Communications Physics, Europhysics Letters, Physical Review Applied, Applied Physics Letters)
- **Education:** Ph.D. Physics (UC San Diego), M.S. Physics (UCSD), B.S. Physics & Applied Mathematics (SUNY Buffalo)

## Migration Notes

- Resume chatbot (bearden-resume-chatbot.com) will be migrated to this app at a later stage
- `/first-fight` page (UFC project) dropped from migration scope
- Some Squarespace images served as WebP; renamed to correct extensions
