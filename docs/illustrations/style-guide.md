# Nano Banana Pro Visual Style Guide

## Overview
This document establishes the cohesive visual identity for seanbearden.com using **Nano Banana Pro** (Gemini 3 Pro Image). The goal is to maintain character consistency and stylistic unity across all site illustrations, avoiding a "parade of one-off generations."

## Master Prompt Template
> `[Subject Description], [Action/Context], [Environment], technical illustration style, high-fidelity, 4K resolution, sharp lines, integrated typography reading "[Text]" (if applicable), consistent with the Sean Bearden professional brand (Scientist + Builder + Leader synthesis), Color Palette: [Dark Slate, Primary White, Accent Blue].`

## Core Pillars
1.  **Scientist**: Represents precision, data visualizations, and abstract physics concepts (memcomputing, dynamical systems).
2.  **Builder**: Represents tools, blueprints, code structures, and cloud architecture.
3.  **Leader**: Represents visionary perspective, professional maturity, and strategic guidance.

## Visual Specifications
*   **Style**: Clean, technical-illustrative synthesis. Avoid typical "AI-art" aesthetics (e.g., over-saturated glows, generic 3D renders).
*   **Typography**: Leverage Nano Banana Pro's text rendering for integrated labels and captions.
*   **Resolution**: 4K rendering for sharp display on retina screens.
*   **Mascot Consistency**: Utilize multi-image conditioning to ensure the Portfolio Agent (#169) maintains identity across multiple state variants.

## Reference Grid (Issue Map)

| Issue | Component | Purpose |
| :--- | :--- | :--- |
| **#164** | Hero Illustration | High-visibility entry point; sets the tone for the site. |
| **#167** | About Narrative | "Scientist + Builder + Leader" synthesis representing professional evolution. |
| **#168** | 404 Personality | Character-driven "Lost in the system" illustration with integrated text. |
| **#165** | Section Dividers | Geometric, SVG-compatible patterns for visual rhythm. |
| **#166** | Portfolio Thumbnails | Cohesive fallback imagery for projects lacking custom visuals. |
| **#169** | Agent Mascot | AI resume assistant avatar; requires character consistency. |
| **#170** | Social Previews | Branded OG/Twitter cards with integrated typography. |

## Implementation Guidelines
*   **Intentionality**: Every generation should feel like a commissioned part of a set, not a random output.
*   **Cohesion**: Maintain consistent line weights and shading across different pages.
*   **Asset Management**: Final outputs should be placed in the `site-data/assets/images/` directory (or a specific `illustrations/` subdirectory if created) and referenced via `assetUrl()`.
