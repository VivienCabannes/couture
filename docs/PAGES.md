# Couture: Page Descriptions

This document describes the purpose, layout, and interactions of each page in the Couture application. It serves as a reference for developers building the front-end and for designers refining the user experience.

## Overview

Couture is organized into six main sections, each accessible from the front page. The pages follow a consistent design language: split-panel layouts for tool pages, responsive grids for browsing pages, and a documentation-style layout for help.

| Page              | Route            | Purpose                                          |
|-------------------|------------------|--------------------------------------------------|
| Designer Studio   | `/designer`      | Sketch garments and refine designs with AI        |
| Pattern Rack      | `/shop`          | Browse and select base pattern pieces             |
| Modelist Corner   | `/modelist`      | Edit and adjust pattern geometry interactively     |
| Measurements      | `/measurements`  | Enter body measurements and select standard sizes |
| Sewing            | `/sewing`        | Follow step-by-step assembly instructions          |
| Help              | `/help`          | Learn how to use the app, explore the glossary     |

---

## Designer Studio (`/designer`)

The Designer Studio is where garment ideas take shape. It combines freehand drawing with AI-assisted generation, letting users sketch a concept and refine it through conversation.

> **Status:** Under active development. The canvas drawing tools (pen, eraser, color picker) are functional, but the AI chat assistant is not yet implemented. On entry, users see an "Under Development" dialog explaining that design tools will be available soon.

### Layout

Two-column flex layout (stacked on mobile):

- **Left panel — Drawing Canvas:** An 800×600 canvas (4:3 aspect ratio) for freehand sketching. A toolbar provides pen, eraser, clear, and color picker tools. Mouse and touch input are supported.
- **Right panel — Notes:** A textarea for jotting down design ideas alongside the sketch.

### Interactions

- Drawing on the canvas produces freehand strokes with the selected color.
- The eraser tool removes strokes (20px width).
- The clear button resets the canvas.
- AI chat integration and the ability to send designs to the Pattern Rack are planned but not yet functional.

---

## Pattern Rack (`/shop`)

The Pattern Rack is where users browse and select base pattern pieces to work with. Pattern pieces are fetched from the API and displayed as cards in a responsive grid.

### Layout

Top-down structure:

- **Pattern grid:** Three columns on desktop, two on tablet, one on mobile. Each card contains:
  - An image placeholder area (pattern illustrations are planned but not yet present)
  - Pattern name (translated via i18n, e.g., "Bodice", "Sleeve")
  - A circular selection indicator in the top-right corner (empty circle when unselected, filled blue circle with checkmark when selected)
- **Bottom bar:** A fixed sticky footer showing a "Go to Modelist Corner" button with a count of selected patterns. If no patterns are selected, clicking shows a brief "Select at least one pattern" warning.

### Interactions

- Clicking a card toggles its selection state (add/remove) via the Zustand selections store.
- Selected cards display a blue ring border and the filled checkmark indicator.
- The "Go to Modelist Corner (N)" button navigates to the Modelist with the selected pieces.
- Search and filter functionality are not yet implemented.

---

## Modelist Corner (`/modelist`)

The Modelist Corner is the technical heart of Couture. This is where pattern pieces are displayed, inspected, and modified. It is designed for users who want precise control over pattern geometry.

### Entry

When no garments are selected, the page shows an empty state with a link to the Pattern Rack. Once pieces are selected (via the Pattern Rack), the full editing interface loads.

### Layout

Two-column flex layout (3:2 ratio on desktop, stacked on mobile):

- **Left panel — Pattern Preview:** A large SVG viewport displaying the generated pattern piece. Supports zoom (0.5× to 10×, mouse wheel or +/− buttons) and pan (pointer drag when zoomed in). A percentage indicator in the bottom-right shows current zoom level and resets on click. The SVG is rendered from backend-generated markup. Users can toggle between **Construction view** (showing construction lines) and **Pattern view** (final pattern only).
- **Right panel — Piece Controls:** Collapsible accordion sections using `<details>` elements:
  - **Size selector:** Dropdown with French sizes T34–T48. Selecting a size applies standard measurements.
  - **Stretch:** (Conditional — only shown for pieces that support stretch.) Horizontal and vertical stretch percentage inputs.
  - **Advanced Controls:** (Conditional — only shown when the pattern type exposes control parameters.) Dynamic list of named parameters with numeric inputs.
  - **Generate button:** Triggers pattern generation with current settings. Shows loading state during generation.

### Piece Tabs

A horizontal tab bar at the top lets users switch between selected pattern pieces (e.g., Bodice, Sleeve). The active tab is visually highlighted with a white background and shadow.

### Interactions

- Selecting a size pre-fills measurements from the standard sizing table.
- Adjusting control parameters and clicking "Generate" produces an updated SVG preview.
- Zoom via mouse wheel (15% per tick) or the +/− overlay buttons.
- Pan by pointer drag when zoomed in beyond 1×.
- Direct Bezier point editing, dart controls, and AI assistant are planned but not yet implemented.

---

## Measurements (`/measurements`)

The Measurements page is where users enter their body measurements. It provides both a visual reference (a body silhouette with measurement lines) and structured input fields. Users can start from a standard size and adjust individual measurements, or enter everything from scratch.

### Layout

Split panel (45/55 on desktop, stacked on mobile):

- **Left panel — Body Silhouette:** An inline SVG showing a front-view body outline with horizontal measurement lines at key positions (bust, waist, hip, etc.). Each line corresponds to a measurement field on the right. When a user focuses an input field, the corresponding line on the silhouette highlights, showing where on the body that measurement is taken.
- **Right panel — Measurement Inputs:**
  - **Preset selector:** A dropdown to apply pre-defined measurement profiles. Available presets: Kwama and Vivien (real body measurement sets). Selecting a preset fills all 24 fields with that person's measurements. Selecting "Standard size" reverts to size-table-based values.
  - **Size selector:** Country dropdown (France, US, UK) and size dropdown (T34 through T48 in French sizing). Selecting a size pre-fills all measurement fields with standard values. Note: only French sizing is currently functional.
  - **Measurement fields:** A two-column grid of labeled inputs, one for each of the 24 body measurements defined in the system. Fields are organized into 5 sections: Lengths, Circumferences, Widths, Arm, and Lower Body. Each field has an "I don't know" checkbox — when checked, the system calculates that measurement algorithmically from the user's other (known) measurements.

### The 24 Measurements

These correspond to the `FullMeasurements` dataclass in the backend:

1. Back Waist Length (`back_waist_length`)
2. Front Waist Length (`front_waist_length`)
3. Full Bust (`full_bust`)
4. Bust Height (`bust_height`)
5. Bust Point Distance (`half_bust_point_distance`)
6. Full Waist (`full_waist`)
7. Small Hip (`small_hip`)
8. Full Hip (`full_hip`)
9. Neck Circumference (`neck_circumference`)
10. Half Back Width (`half_back_width`)
11. Half Front Width (`half_front_width`)
12. Shoulder Length (`shoulder_length`)
13. Armhole Circumference (`armhole_circumference`)
14. Underarm Height (`underarm_height`)
15. Arm Length (`arm_length`)
16. Upper Arm (`upper_arm`)
17. Elbow Height (`elbow_height`)
18. Wrist (`wrist`)
19. Waist to Hip (`waist_to_hip`)
20. Crotch Depth (`crotch_depth`)
21. Crotch Length (`crotch_length`)
22. Waist to Knee (`waist_to_knee`)
23. Waist to Floor (`waist_to_floor`)
24. Side Waist to Floor (`side_waist_to_floor`)

### Interactions

- Focusing a measurement input highlights the corresponding line on the body silhouette SVG.
- Selecting a preset (Kwama or Vivien) populates all fields with that person's measurements.
- Selecting a standard size populates all fields with default values from the sizing table (French T34–T48).
- Checking "I don't know" on a field disables the input and marks it for algorithmic estimation.
- All values are in centimeters.
- Measurements are persisted to the backend via the Zustand measurements store and are available across all pages (e.g., pre-loaded in the Modelist).

---

## Sewing (`/sewing`)

The Sewing page provides step-by-step assembly instructions for constructing the garment from cut pattern pieces. This page is planned but not yet detailed.

### Layout

Sequential, instruction-based layout:

- A numbered list of assembly steps, each with a description and (eventually) an illustration.
- Steps may include tips on stitch type, seam allowance, and pressing.

### Status

Under development. The page currently serves as a placeholder. Detailed layout and interactions will be defined as the feature is built.

---

## Help (`/help`)

The Help page is the app's documentation center. It provides an overview of Couture, a getting-started guide, a glossary of sewing and pattern-drafting terms, and answers to frequently asked questions.

### Layout

Documentation-style layout:

- **Desktop:** Left sidebar with a table of contents (sticky), right article area with the content.
- **Mobile:** The TOC collapses to the top of the page as a scrollable horizontal list or a collapsible menu.

### Sections

- **How it Works:** A high-level overview of the Couture workflow — from design to pattern to sewing.
- **Getting Started:** Step-by-step guide for new users: enter measurements, pick a pattern, customize, export.
- **Glossary:** An alphabetical list of sewing and pattern-drafting terms with concise definitions. Terms include:
  - **Sloper** — A basic, close-fitting pattern shape from which other patterns are derived.
  - **Dart** — A triangular fold sewn into fabric to shape it to the body's curves.
  - **Ease** — Extra room added to a pattern beyond exact body measurements for comfort or design.
  - **Grain line** — The direction of the fabric's threads, which determines how it drapes and stretches.
  - **Moulage** — The technique of draping fabric directly on a dress form to create a pattern.
- **FAQ:** Common questions about file formats, supported sizes, browser compatibility, etc.

### Interactions

- Clicking a term in the TOC scrolls to the corresponding section.
- Glossary terms that appear in other sections are styled as clickable links (underlined, blue) that jump to the glossary definition. This cross-linking helps users learn terminology in context.
- The TOC highlights the currently visible section as the user scrolls.
