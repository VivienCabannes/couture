# Front Page Design

## Purpose

The front page is the app's entry point and primary navigation hub. Rather than dropping users directly into a pattern listing, the front page surfaces the 6 major areas of the Couture platform as a clear, card-based menu. Each card provides trilingual labels (English, French, and Spanish) and links to its respective section.

## Navigation Structure

| English           | French               | Spanish                 | Route            | Description                                        |
|-------------------|----------------------|-------------------------|------------------|----------------------------------------------------|
| Designer Studio   | Atelier Création     | Estudio de Diseño       | `/designer`      | Conceptualize garments, draw silhouettes            |
| Pattern Rack      | Vestiaire des Patrons | Perchero de Patrones   | `/shop`          | Browse and select base pattern pieces               |
| Modelist Corner   | Atelier Modélisme    | Rincón del Modelista    | `/modelist`      | Draft, alter, and grade patterns from measurements  |
| Measurements      | Mesures              | Medidas                 | `/measurements`  | Enter and manage body measurements                  |
| Sewing            | Assemblage           | Costura                 | `/sewing`        | Assembly instructions and construction guides       |
| Help              | Aide                 | Ayuda                   | `/help`          | Documentation, tutorials, and support               |

## Visual Design

### Card Anatomy

Each navigation card contains four elements stacked vertically:

1. **Icon area** — A 64×64px rounded container with a `blue-50` background (`#eff6ff`), containing an inline SVG icon rendered in the primary blue (`#2563eb`).
2. **Primary label** — The section name in the current primary language. Rendered in `text-lg font-semibold text-gray-900`.
3. **Secondary label** — The section name in the second language. Rendered in `text-sm text-gray-600`.
4. **Tertiary label** — The section name in the third language. Rendered in `text-sm text-gray-600`.

### Colors — Light Mode (default)

| Token               | Value       | Usage                          |
|----------------------|-------------|--------------------------------|
| Background           | `#f9fafb`   | Page background (gray-50)      |
| Card background      | `#ffffff`   | Card surface                   |
| Header background    | `#ffffff`   | Header bar                     |
| Primary blue         | `#2563eb`   | Icons, interactive accents     |
| Icon background      | `#eff6ff`   | Icon container (blue-50)       |
| Heading text         | `#111827`   | Primary labels (gray-900)      |
| Secondary text       | `#4b5563`   | Subtitles, descriptions (gray-600) |

### Colors — Dark Mode

| Token               | Value       | Usage                          |
|----------------------|-------------|--------------------------------|
| Background           | `#111827`   | Page background (gray-900)     |
| Card background      | `#1f2937`   | Card surface (gray-800)        |
| Header background    | `#1f2937`   | Header bar (gray-800)          |
| Primary blue         | `#60a5fa`   | Icons, interactive accents (blue-400) |
| Icon background      | `#1e3a5f`   | Icon container (dark blue)     |
| Heading text         | `#f9fafb`   | Primary labels (gray-50)       |
| Secondary text       | `#9ca3af`   | Subtitles, descriptions (gray-400) |

### Spacing

- Page padding: `24px` horizontal, `40px` vertical
- Max content width: `1152px` (6xl), centered
- Card padding: `28px` (p-7)
- Grid gap: `20px` (gap-5)
- Icon to label spacing: `16px`
- Label to label spacing: `2px`

### Shadows & Radius

- Card default: `shadow-sm`
- Card hover: `shadow-md` with a slight upward translate (`translateY(-2px)`)
- Card border radius: `rounded-xl`
- Transition: `200ms` ease; theme transitions use `300ms`

## Responsive Layout

The card grid adapts to viewport width using three breakpoints:

| Viewport       | Columns | Breakpoint  |
|----------------|---------|-------------|
| Mobile         | 1       | < 640px     |
| Tablet         | 2       | ≥ 640px     |
| Desktop        | 3       | ≥ 1024px    |

The grid uses CSS Grid with `gap: 1.25rem` and adjusts `grid-template-columns` at each breakpoint.

## Internationalization

All three language labels (English, French, Spanish) are always visible on every card. The language toggle in the header cycles through the three languages, controlling which label appears as the primary (large, bold) text. The other two appear as secondary subtitles.

- Default state: English is primary; French and Spanish are subtitles
- First click: French is primary; English and Spanish are subtitles
- Second click: Spanish is primary; English and French are subtitles
- Third click: back to English

The toggle button displays the *next* language code (e.g., shows "FR" when English is active, "ES" when French is active, "EN" when Spanish is active).

Implementation: each card label element stores all three translations in `data-en`, `data-fr`, and `data-es` attributes. JavaScript cycles through the language list and updates text content and CSS classes accordingly.

## Dark / Light Mode

A theme toggle button in the header switches between light and dark modes. The button displays a moon icon in light mode and a sun icon in dark mode.

Implementation: a CSS class on `<body>` (`dark`) activates dark-mode color overrides. A single event listener toggles the class and swaps the icon SVG. All color transitions use `300ms` for a smooth switch.

## Reference

The front page is implemented in `frontend/web/src/features/home/` and `frontend/mobile/src/features/home/`. The responsive card grid, language toggle, and dark mode are functional in both web and mobile apps.
