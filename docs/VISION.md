# Couture: Vision, Mission, and Roadmap

Welcome to the **Couture** project! This document outlines our core philosophy, where we fit into the garment creation process, and our technical roadmap. Whether you are a developer, a mathematician, or a sewing enthusiast, this guide will help you understand our goals.

## The Context: How Clothes are Made

To understand what Couture does, it helps to look at the traditional lifecycles of garment creation.

### The Professional Pipeline

In a traditional fashion brand, creating a garment is a highly segmented process:

1. **The Designer:** Conceptualizes the garment and draws the initial silhouette.
2. **The Technical Designer / Product Developer:** Sources fabrics, defines construction details, and translates the designer's sketch into a 2D technical drawing (flat sketch).
3. **The Modelist (Patternmaker):** Translates the technical drawing into a 2D mathematical blueprint (the pattern) based on specific body measurements. This may involve flat drafting or draping on a dress form (moulage).
4. **The Sample Maker:** Constructs a prototype (toile/muslin) in inexpensive fabric to verify fit and construction before production.
5. **The Grader:** Scales the approved pattern across the full size range.
6. **The Cutter:** Lays out and cuts the production fabric according to the graded patterns.
7. **The Machinist/Sewer:** Assembles and sews the cut pieces into the final garment.

### The Hobbyist Pipeline

For home sewists, the process is a bit different:

1. Go to the store and buy fabric.
2. Pick a pre-made pattern online or from a catalog.
3. **Alter the pattern to fit their specific body measurements.**
4. Cut and sew the garment at home.

## Our Mission: Empowering the Modelist

Notice the bottleneck in both pipelines: **translating measurements into a fitted 2D pattern.** Modelism (pattern drafting and alteration) is highly mathematical. It involves geometry, grading, and precise spatial calculations. Traditionally, this is done by hand with rulers and French curves, which is time-consuming and prone to human error.

**The goal of the Couture app is to provide computer assistance to the modelist and the hobbyist.** Rather than calculating ease, dart placement, and curve radii by hand, Couture uses code to mathematically generate and adjust patterns based on user measurements. We want to make the engineering of clothing accessible, precise, and automated.

## Design Philosophy: User Experience First

We do not build for generality first. We build for **ease of use** first.

Pattern drafting software tends to expose every possible parameter and leave the user to figure things out. Couture takes the opposite approach: every feature ships with a clear, simple interface from day one. We would rather do fewer things well than many things confusingly. The math must be correct, but correctness alone is not enough — if the tool is hard to use, it has failed.

This means:

* **Sensible defaults over configuration.** A user should be able to generate a usable pattern by entering just their measurements. Advanced settings exist but stay out of the way.
* **Immediate visual feedback.** Every change to a measurement or parameter should produce an updated pattern instantly. Users should never wonder what effect their input had.
* **Progressive disclosure.** Beginners see a simple flow. Advanced users can unlock deeper controls. Nobody is overwhelmed on first use.
* **Concrete over abstract.** We build specific, well-polished patterns (a bodice block, a sleeve, a dress) rather than a generic "pattern construction toolkit" that requires expertise to operate.

## Project Roadmap

### Phase 1: The Foundation ✓

**Goal:** Generate reliable base patterns to *any* size using a CLI that is easy to use.

* **Core Backend:** Python architecture for measurements, points, lines, and curves — done.
* **Base Blocks:** Standard, mathematically sound base patterns (slopers/blocks) that scale correctly to any inputted measurement — done.
* **CLI Experience:** Pattern generation via CLI with sensible defaults — done (`backend/cli/`).
* **Export:** SVG output from the backend — done. PDF/projector export is planned.

### Phase 2: Advanced Adjustments & Customization (Partially Complete)

**Goal:** Allow for granular pattern manipulation without sacrificing CLI simplicity.

* **Ease Control:** Ease adjustment via control parameters — done. Exposed in the Modelist UI as "Advanced Controls".
* **Dart Manipulation:** Functions to add, move, or split darts — planned, not yet implemented.
* **Progressive Options:** Advanced parameters available via optional flags — done. The default command stays simple.

### Phase 3: The Front-End Experience (In Progress)

**Goal:** Apply UX principles to make the tool accessible to non-programmers.

* **Web & Mobile Front-End:** React (web) and React Native (mobile) apps are functional with home, measurements, Pattern Rack, Modelist, and help pages. Designer and sewing pages are under development.
* **Measurements:** Full measurement input with standard sizing (French T34–T48), "I don't know" algorithmic estimation, and preset profiles (Kwama, Vivien). Measurements persist across pages via Zustand stores.
* **Pattern Rack:** Card-based browsing of pattern pieces with selection tracking via Zustand store.
* **Modelist Corner:** Piece tabs, SVG preview with zoom/pan, size selector, stretch and advanced controls, construction/pattern view toggle.
* **Interactive Tweaking:** Control parameters and stretch adjustments are functional. Direct Bezier point editing is planned.
* **Export:** PDF/projector export from the front-end is planned.

### Phase 4: Expanded Pattern Library & Community

**Goal:** Broaden what users can make and let them share their work.

* **More Patterns:** Add new garment types beyond the initial blocks, driven by user demand.
* **Sharing & Collaboration:** Let users save, share, and remix patterns.
