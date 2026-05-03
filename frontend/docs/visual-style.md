# Visual Style Guide: Nano Banana Pro

This document defines the coherent illustration aesthetic for the Sean Bearden portfolio site, ensuring consistency across all AI-generated imagery.

## 1. Style Anchors

### Palette
Anchored on the existing Tailwind dark theme with specific accent colors for glows and highlights.
- **Background**: Dark Gray/Black (`oklch(0.145 0 0)`)
- **Primary Accent**: Cyan (`oklch(0.7 0.2 200)`) — used for technical highlights and energy motifs.
- **Secondary Accent**: Indigo (`oklch(0.6 0.2 300)`) — used for depth and shadow-glows.
- **Foreground Lines**: White/Light Gray (`oklch(0.985 0 0)`) — ultra-fine strokes.

### Illustration Mode
**Technical-Scientific Surrealism**
- **Characteristics**: Minimalist fine lines, isometric or blueprint-style perspectives, and volumetric glows.
- **Vibe**: Precision meets abstraction. It should look like a high-end physics paper merged with futuristic UI design.
- **Consistency**: Avoid heavy textures or painterly brushes. Stick to clean gradients and vector-like clarity.

### Motif Vocabulary
Recurring visual elements that tie the site's physics and AI background together:
- **Waveforms**: Sine waves, probability distributions, and interference patterns.
- **Neural Topologies**: Interconnected nodes and edges representing AI networks.
- **Circuit Traces**: Rectilinear paths and contact points (integrated circuit aesthetic).
- **Stochastic Particles**: Cloud-like clusters of points representing data or quantum states.

---

## 2. Master Prompt Template

Use this template with "Nano Banana Pro" (Gemini 3 Pro Image) to ensure style consistency.

**Prompt Template:**
> `[Subject] in a Technical-Scientific Surrealist style. Minimalist fine-line illustration with volumetric [Accent Color] glows. Compose with integrated [Motif] elements. Deep black background, high contrast, sharp vector-like edges. Professional, clean, and futuristic aesthetic.`

---

## 3. Reference Grid (4-Image Aesthetic)

To establish the style, generate or reference these four archetypes:

1.  **Abstract (The Concept)**:
    - *Subject*: A Memcomputing dynamical system.
    - *Details*: A complex attractor landscape with glowing orbital paths and particle clusters.
2.  **Character (The Persona)**:
    - *Subject*: A silhouette of a scientist.
    - *Details*: Silhouette composed of glowing neural network nodes and circuit traces.
3.  **Scene (The Environment)**:
    - *Subject*: A quantum computing laboratory.
    - *Details*: Minimalist isometric view of a dilution refrigerator with glowing coolant lines and waveform patterns in the air.
4.  **Technical (The Detail)**:
    - *Subject*: A RAG (Retrieval-Augmented Generation) architecture.
    - *Details*: A schematic diagram where document icons are linked by glowing data streams and particle systems.

---

## 4. Implementation Workflow

To maintain scalability and performance:

1.  **Generate**: Produce high-resolution raster images (WebP/PNG) using the master prompt template.
2.  **Vectorize**: Run the raster through `vtracer` or a similar tool to create SVG paths for scalable elements.
3.  **Optimize**: Clean up SVGs (minify) and use Tailwind CSS for hover effects or color adjustments.
4.  **Deploy**: Host the final assets in the GCS bucket (`seanbearden-assets`).
