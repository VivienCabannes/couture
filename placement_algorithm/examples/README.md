# Pattern Examples

This directory contains example pattern files and outputs for the placement algorithm.

## Files

### `simple_dress_pattern.svg`

A complete example SVG pattern file for a simple dress with the following pieces:

- **Front Bodice** (1x) - 65cm × 130cm
- **Back Bodice** (1x) - 65cm × 130cm  
- **Front Skirt** (1x) - 80cm × 135cm
- **Back Skirt** (1x) - 85cm × 135cm
- **Sleeve** (2x) - 65cm × 130cm
- **Collar Band** (1x) - 100cm × 20cm
- **Waistband** (1x) - 140cm × 20cm

All pieces include:
- **Seam allowance**: 1.5cm (except bandstand pieces which use 0.6cm)
- **Grain direction**: 0° (vertical, except bias-cut pieces at 90°)
- **Custom labels**: Name, fabric type, and size information

### Placement Outputs

Generated placement outputs (created when running examples) will be saved as:

- `placement_1.svg` - Best placement from first run
- `placement_2.svg` - Alternative placements (if generated)
- etc.

Each output SVG includes:
- Actual fabric rectangle with dimensions
- Placed piece outlines
- Piece labels and metadata
- Legend showing piece colors
- Grid overlay (optional)

## Creating Custom SVG Patterns

For detailed instructions on creating SVG pattern files compatible with the placement algorithm, see:

**[`docs/svg_format_guide.md`](../docs/svg_format_guide.md)**

The guide covers:

- **SVG Metadata Attributes** - Custom XML attributes for piece information
- **Path Elements** - How to define piece contours
- **Bezier Curves** - Creating smooth, curved piece edges
- **Grain Direction** - Specifying fabric grain for pattern flow
- **Folding Lines** - Advanced feature for complex placements
- **Real-World Examples** - Complete pattern file examples
- **Tool-Specific Instructions** - Creating files in Inkscape, Illustrator, CorelDRAW
- **Best Practices** - Guidelines for optimal algorithm performance
- **Troubleshooting** - Common issues and solutions
- **Validation** - Checking your files for correctness

### Quick Start

1. Create an SVG file with your pattern pieces
2. Use path elements (`<path>`) to define each piece contour
3. Add required attributes:
   - `data-piece-id="unique_name"` - Piece identifier
   - `data-multiplicity="count"` - Number of copies needed (optional, default: 1)
   - `data-seam-allowance="cm"` - Seam allowance (optional, default: 0)
   - `data-grain-direction="degrees"` - Grain direction (optional, default: 0)
4. Optionally add labels:
   - `data-label-name="Display Name"`
   - `data-label-fabric="Fabric Type"`
   - `data-label-*="Value"` - Custom labels

### Example Minimal SVG

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <path d="M 10 10 L 100 10 L 100 100 L 10 100 Z"
        data-piece-id="front_panel"
        data-multiplicity="1"
        data-seam-allowance="1.5"
        data-grain-direction="0"/>
</svg>
```

## Running Examples

From the command line:

```bash
# Run all examples (including SVG loading)
python example.py

# Run a single example function
python -c "from example import example_with_svg; example_with_svg()"
```

The SVG example will:

1. Load the `simple_dress_pattern.svg` file
2. Parse all pieces and their metadata
3. Generate multiple placement arrangements
4. Save the best placement as `placement_1.svg`
5. Display cost and efficiency metrics

## Expected Output

When running `example_with_svg()`, you should see:

```
============================================================
EXAMPLE 4: Loading Pieces from SVG Pattern File
============================================================

Loading SVG pattern from: simple_dress_pattern.svg

Parsed 7 unique piece design(s):
  - front_bodice: 65.0x130.0cm, qty=1, seam=1.5cm
  - back_bodice: 65.0x130.0cm, qty=1, seam=1.5cm
  - front_skirt: 80.0x135.0cm, qty=1, seam=1.5cm
  - back_skirt: 85.0x135.0cm, qty=1, seam=1.5cm
  - sleeve: 65.0x130.0cm, qty=2, seam=1.5cm
  - collar_band: 100.0x20.0cm, qty=1, seam=0.6cm
  - waistband: 140.0x20.0cm, qty=1, seam=0.6cm
Total pieces needed (with multiplicity): 11

Fabric: 150.0cm wide, $0.2/cm

Generating placements...

Generated 3 placement(s)

Placement 1:
  Fabric length: ... cm (... m)
  Total cost: $...
  Efficiency: ...%
  Valid: True
  ✓ Output saved to: placement_1.svg
```

## Debugging SVG Files

If you encounter parsing errors:

1. **Validate XML**: Ensure your SVG is well-formed XML
   ```bash
   xmllint --noout your_pattern.svg
   ```

2. **Check required attributes**: Every piece must have `data-piece-id`

3. **Check path syntax**: Use valid SVG path commands (M, L, H, V, C, Q, Z)

4. **Test with converter**: Try opening in Inkscape or Illustrator to validate

5. **See examples**: Look at `simple_dress_pattern.svg` for correct formatting

## Advanced Features

### Folding Lines

For pieces that will be cut from folded fabric:

```xml
<path d="..."
      data-piece-id="front"
      data-multiplicity="1"
      data-cut-on-fold="0,1"
      data-folding-lines="[{&quot;start&quot;: [0, 0], &quot;end&quot;: [50, 0]}]"/>
```

See `docs/svg_format_guide.md` for complete JSON format.

### Custom Data  

Add any custom information with `data-label-*` attributes:

```xml
<path d="..."
      data-piece-id="front"
      data-label-color="navy blue"
      data-label-stretch="horizontal"
      data-label-print-instructions="Match stripes at side seams"/>
```

These are preserved in the Piece's `labels` dictionary and in output SVG.

---

For more information, see:
- [`docs/svg_format_guide.md`](../docs/svg_format_guide.md) - Complete SVG specification
- [`docs/phase_2_completion.md`](../docs/phase_2_completion.md) - Implementation details
- `example.py` - Example usage code
