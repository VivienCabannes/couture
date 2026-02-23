# Couture: Page Descriptions

This document describes the purpose, layout, and interactions of each page in the Couture application. It serves as a reference for developers building the front-end and for designers refining the user experience.

## Overview

Couture is organized into six main sections, each accessible from the front page. The pages follow a consistent design language: split-panel layouts for tool pages, responsive grids for browsing pages, and a documentation-style layout for help.

| Page              | Route            | Purpose                                          |
|-------------------|------------------|--------------------------------------------------|
| Designer Studio   | `/designer`      | Sketch garments and refine designs with AI        |
| Pattern Shop      | `/shop`          | Browse, search, and acquire sewing patterns       |
| Modelist Corner   | `/modelist`      | Edit and adjust pattern geometry interactively     |
| Measurements      | `/measurements`  | Enter body measurements and select standard sizes |
| Sewing            | `/sewing`        | Follow step-by-step assembly instructions          |
| Help              | `/help`          | Learn how to use the app, explore the glossary     |

---

## Designer Studio (`/designer`)

The Designer Studio is where garment ideas take shape. It combines freehand drawing with AI-assisted generation, letting users sketch a concept and refine it through conversation.

### Layout

Split panel (50/50 on desktop, stacked on mobile):

- **Left panel — Drawing Canvas:** A blank canvas for freehand sketching. A small toolbar along the top or left edge provides drawing tools: pencil (freehand), line, curve, and eraser. Users draw rough silhouettes or design details directly on the canvas.
- **Right panel — AI Chat:** A conversational interface where users describe what they want in natural language. The AI generates or refines sketches based on text descriptions. The panel displays a chat history (user messages and AI responses with generated images) and an input bar at the bottom.

### Interactions

- Drawing on the canvas produces vector strokes that can be sent to the AI as context.
- Typing a description in the chat (e.g., "A-line dress with boat neckline") triggers the AI to generate a sketch.
- The AI can modify an existing canvas drawing based on follow-up instructions.
- Users can save designs and send them to the Pattern Shop for pattern matching.

---

## Pattern Shop (`/shop`)

The Pattern Shop is a discovery and browsing page, similar in spirit to pattern marketplaces like sewist.com. Users search for patterns by keyword, filter by category or difficulty, and preview pattern details before selecting one.

### Layout

Top-down structure:

- **Search bar** at the top, with filter buttons (category, difficulty level) below or beside it.
- **Pattern grid** below the search area. Three columns on desktop, two on tablet, one on mobile. Each card in the grid contains:
  - An image placeholder (pattern illustration or photo)
  - Pattern name
  - Difficulty badge (beginner / intermediate / advanced)
  - Short description

### Interactions

- Typing in the search bar filters the grid in real time.
- Clicking a filter button (e.g., "Tops", "Dresses", "Beginner") narrows results.
- The AI can suggest patterns that match a design from the Designer Studio — a banner or button links the two features.
- Clicking a pattern card opens a detail view (future scope).

---

## Modelist Corner (`/modelist`)

The Modelist Corner is the technical heart of Couture. This is where pattern pieces are displayed, inspected, and modified. It is designed for users who want precise control over pattern geometry — adjusting curves, moving points, and fine-tuning fit.

### Layout

Split panel (60/40 on desktop, stacked on mobile):

- **Left panel — Pattern Viewport:** A large SVG viewport displaying the current pattern piece(s). Users can zoom and pan. The pattern is rendered as editable geometry: Bezier control points are visible and draggable.
- **Right panel — Modification Controls:** A vertical stack of collapsible sections:
  - **Adjustments:** Numeric inputs for ease, seam allowance, and key dimensions.
  - **Dart Controls:** Options to add, move, rotate, or split darts.
  - **AI Assistant:** A text input where users type natural-language commands (e.g., "add 2cm ease at the hip") and the AI applies the corresponding geometric transformation.

### Interactions

- Dragging a Bezier control point on the SVG updates the curve in real time.
- Moving a pattern point adjusts related measurements and redraws connected curves.
- Changing a numeric input in the right panel updates the SVG immediately.
- AI text commands are parsed and applied as geometric operations on the pattern.
- Zoom +/- buttons control the viewport scale.

---

## Measurements (`/measurements`)

The Measurements page is where users enter their body measurements. It provides both a visual reference (a body silhouette with measurement lines) and structured input fields. Users can start from a standard size and adjust individual measurements, or enter everything from scratch.

### Layout

Split panel (45/55 on desktop, stacked on mobile):

- **Left panel — Body Silhouette:** An inline SVG showing a front-view body outline with horizontal measurement lines at key positions (bust, waist, hip, etc.). Each line corresponds to a measurement field on the right. When a user focuses an input field, the corresponding line on the silhouette highlights, showing where on the body that measurement is taken.
- **Right panel — Measurement Inputs:**
  - **Size selector:** Country dropdown (France, US, UK) and size dropdown (T34 through T48 in French sizing). Selecting a size pre-fills all measurement fields with standard values.
  - **Measurement fields:** A two-column grid of labeled inputs, one for each of the 24 body measurements defined in the system. Each field has an "I don't know" checkbox — when checked, the system calculates that measurement algorithmically from the user's other (known) measurements.

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
- Selecting a standard size populates all fields with default values from the sizing table (French T34–T48).
- Checking "I don't know" on a field disables the input and marks it for algorithmic estimation.
- All values are in centimeters.

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
