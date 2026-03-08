# SVG Pattern Format Guide

Complete guide to creating and structuring SVG files for use with the pattern nesting system.

## Overview

SVG (Scalable Vector Graphics) files containing pattern pieces must follow specific conventions to work with the nesting system. This guide explains how to structure your SVG files for optimal results.

## Basic Structure

### Minimal SVG with One Piece

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <path d="M 0 0 L 40 0 L 40 60 L 0 60 Z" 
        data-piece-id="panel1"
        data-multiplicity="1"
        data-seam-allowance="1.0"/>
</svg>
```

### Key Attributes Explained

| Attribute | Required | Type | Example | Notes |
|-----------|----------|------|---------|-------|
| `data-piece-id` | Yes | String | "front_panel" | Unique identifier for piece |
| `data-multiplicity` | No | Integer | 2 | Number of copies needed, default: 1 |
| `data-seam-allowance` | No | Float | 1.5 | Seam allowance in cm, default: 0 |
| `data-grain-direction` | No | Float | 0 | Grain angle in degrees, default: 0 (vertical) |
| `data-label-*` | No | String | Multiple allowed | Custom labels (e.g., `data-label-name="Front"`) |
| `data-cut-on-fold` | No | String | "0,2" | Comma-separated side indices (optional) |
| `data-folding-lines` | No | JSON | See below | Folding line specifications |

## SVG Path Data

Paths are defined using SVG path commands. The parser supports:

### Supported Commands

| Command | Name | Format | Example |
|---------|------|--------|---------|
| M/m | Move To | `M x y` or `m dx dy` | `M 10 10` |
| L/l | Line To | `L x y` or `l dx dy` | `L 50 10` |
| H/h | Horizontal | `H x` or `h dx` | `H 50` |
| V/v | Vertical | `V y` or `v dy` | `V 50` |
| C/c | Cubic Bezier | `C x1 y1 x2 y2 x y` | `C 10 10 20 20 30 30` |
| Q/q | Quadratic | `Q x1 y1 x y` | `Q 15 15 30 30` |
| Z/z | Close Path | `Z` | (No parameters) |

### Examples

**Rectangle:**
```xml
<path d="M 0 0 L 40 0 L 40 60 L 0 60 Z" data-piece-id="rect"/>
```

**Circle (approximated):**
```xml
<path d="M 30 0 C 30 -16.6 16.6 -30 0 -30 C -16.6 -30 -30 -16.6 -30 0 Z" 
      data-piece-id="circle"/>
```

**Triangle:**
```xml
<path d="M 0 0 L 40 0 L 20 40 Z" data-piece-id="triangle"/>
```

**Complex Curve:**
```xml
<path d="M 0 0 C 10 -10 30 -10 40 0 L 40 40 Q 20 50 0 40 Z" 
      data-piece-id="shaped"/>
```

## Grain Direction

Grain direction determines how the piece is oriented on the fabric. Since rotation is not permitted, grain direction should be consistent across all pieces (typically vertical = 0°).

**Grain Angle Convention:**
- **0°**: Vertical (default, along Y-axis)
- **90°**: Horizontal (along X-axis)
- **45°**: Diagonal (northwest to southeast)

```xml
<!-- Default vertical grain -->
<path d="..." data-piece-id="p1" data-grain-direction="0"/>

<!-- Horizontal grain -->
<path d="..." data-piece-id="p2" data-grain-direction="90"/>

<!-- Diagonal grain -->
<path d="..." data-piece-id="p3" data-grain-direction="45"/>
```

## Multiplicity

Multiplicity specifies how many copies of each piece need to be cut.

```xml
<!-- Single copy -->
<path d="..." data-piece-id="collar" data-multiplicity="1"/>

<!-- Two copies -->
<path d="..." data-piece-id="sleeve" data-multiplicity="2"/>

<!-- Four copies -->
<path d="..." data-piece-id="button" data-multiplicity="4"/>
```

## Seam Allowance

Seam allowance is the extra fabric around each piece for sewing. Specified in centimeters.

```xml
<!-- 1 cm seam allowance -->
<path d="..." data-piece-id="panel" data-seam-allowance="1.0"/>

<!-- 1.5 cm seam allowance (common for woven fabrics) -->
<path d="..." data-piece-id="panel" data-seam-allowance="1.5"/>

<!-- 0.6 cm seam allowance (common for knits) -->
<path d="..." data-piece-id="panel" data-seam-allowance="0.6"/>
```

## Labels

Custom labels can be added to identify and organize pieces. Labels are key-value pairs:

```xml
<path d="..." 
      data-piece-id="panel_front"
      data-label-name="Front Panel"
      data-label-size="Large"
      data-label-fabric="Cotton"
      data-label-notes="Main body piece"/>
```

Labels are automatically extracted and displayed in placement visualizations.

**Common Label Keys:**
- `name`: Descriptive piece name
- `size`: Size category (Small, Medium, Large, XL, etc.)
- `fabric`: Fabric type or specification
- `notes`: Additional notes or instructions
- `quantity`: Quantity info (usually prefer `multiplicity` attribute)
- `pattern`: Pattern type (e.g., "Straight", "Bias", "On Fold")

## Folding Lines

For pieces that should be cut on a fold, define folding lines. Folding lines enable cutting one piece as two (or more) by folding the fabric.

### JSON Array Format

```xml
<path d="..." 
      data-piece-id="sleeve"
      data-folding-lines='[
        {"x1": 0, "y1": 30, "x2": 40, "y2": 30, "order": 0}
      ]'/>
```

### Multiple Folding Lines

```xml
<path d="..." 
      data-piece-id="complex"
      data-cut-on-fold="0,1"
      data-folding-lines='[
        {"x1": 0, "y1": 20, "x2": 50, "y2": 20, "order": 0},
        {"x1": 0, "y1": 40, "x2": 50, "y2": 40, "order": 1}
      ]'/>
```

**Folding Line Properties:**
- `x1, y1`: Start point coordinates
- `x2, y2`: End point coordinates
- `order`: Folding sequence (0 = first fold, 1 = second fold, etc.)

## Complete Example: T-Shirt Pattern

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
  <title>T-Shirt Pattern</title>
  
  <!-- Front Panel -->
  <path d="M 20 20 L 80 20 L 85 100 L 80 200 L 20 200 L 15 100 Z"
        data-piece-id="front"
        data-multiplicity="1"
        data-seam-allowance="1.5"
        data-grain-direction="0"
        data-label-name="Front Panel"
        data-label-fabric="Cotton Knit"
        data-label-size="Medium"/>
  
  <!-- Back Panel -->
  <path d="M 100 20 L 160 20 L 165 100 L 160 200 L 100 200 L 95 100 Z"
        data-piece-id="back"
        data-multiplicity="1"
        data-seam-allowance="1.5"
        data-grain-direction="0"
        data-label-name="Back Panel"
        data-label-fabric="Cotton Knit"
        data-label-size="Medium"/>
  
  <!-- Sleeve (needs 2 copies) -->
  <path d="M 180 50 L 220 50 L 225 120 L 220 180 L 180 180 L 175 120 Z"
        data-piece-id="sleeve"
        data-multiplicity="2"
        data-seam-allowance="1.5"
        data-grain-direction="0"
        data-label-name="Sleeve"
        data-label-fabric="Cotton Knit"/>
  
  <!-- Collar Band -->
  <path d="M 20 280 L 80 280 L 80 300 L 20 300 Z"
        data-piece-id="collar"
        data-multiplicity="1"
        data-seam-allowance="0.6"
        data-grain-direction="90"
        data-label-name="Collar Band"/>
  
</svg>
```

## Creating SVG Files

### Using Design Tools

#### Adobe Illustrator
1. Create your pattern pieces as separate shapes/paths
2. Add custom XML attributes via File > Document Properties > Advanced
3. Actually, use Find and Replace to add attributes to SVG:
   - Export as SVG (File > Export As)
   - Open in text editor
   - Add `data-*` attributes manually to `<path>` elements

#### Inkscape (Recommended for Free Solution)
1. Create pattern pieces as separate paths
2. For each path, right-click and select "Edit XML"
3. Click "Set attribute" and add `data-piece-id`, etc.
4. File > Save As > Scalable Vector Graphic (*.svg)

#### CorelDRAW
1. Create pattern pieces
2. Convert to paths (Arrange > Convert to Curves)
3. Export as SVG
4. Edit SVG in text editor to add attributes

### Manual Creation

Edit SVG files directly in a text editor:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500">
  <!-- Copy-paste and edit path examples from above -->
</svg>
```

### Recommended Workflow

1. **Design Pattern** → Use your preferred tool
2. **Export SVG** → Save in high-quality SVG format
3. **Edit XML** → Add `data-*` attributes
4. **Validate** → Test with parser
5. **Optimize** → Simplify paths if needed for performance

## Best Practices

### DO:
- ✅ Use descriptive piece IDs (e.g., "front_panel" not "p1")
- ✅ Close all paths with Z command
- ✅ Use consistent units (preferably in centimeters)
- ✅ Specify seam allowance for all pieces
- ✅ Add descriptive labels
- ✅ Test SVG file with parser before solving
- ✅ Group related metadata together as attributes

### DON'T:
- ❌ Use text elements for piece identification (use attributes instead)
- ❌ Rotate pieces in SVG (nesting system assumes no rotation)
- ❌ Use transforms that are not simple translations
- ❌ Include decorative elements not needed for nesting
- ❌ Use relative commands exclusively (mix with absolute for clarity)
- ❌ Forget to close paths with Z

## Common Issues and Solutions

### Issue: Pieces not parsing
**Solution:** Ensure all pieces have `data-piece-id` attribute and valid path data.

### Issue: Incorrect grain direction
**Solution:** Check `data-grain-direction` value (0 = vertical, 90 = horizontal, etc.)

### Issue: Seam allowance not working
**Solution:** Verify `data-seam-allowance` is a valid float number in centimeters.

### Issue: Labels not showing
**Solution:** Use `data-label-*` attributes (e.g., `data-label-name="Panel A"`).

### Issue: Bezier curves look wrong
**Solution:** The parser may need curve tolerance adjustment. Try simplifying curves or export with more path precision.

## Validation

To validate your SVG file works with the nesting system:

```python
from algo.svg_parser import SVGParser

parser = SVGParser()
try:
    pieces = parser.parse_svg_file("my_pattern.svg")
    print(f"✓ Successfully parsed {len(pieces)} pieces:")
    for piece in pieces:
        print(f"  - {piece.id} ({piece.multiplicity}× copies)")
except Exception as e:
    print(f"✗ Error parsing SVG: {e}")
```

## SVG Coordinate System

The SVG coordinate system uses:
- **X-axis**: Horizontal, left to right
- **Y-axis**: Vertical, top to bottom

**Important:** The nesting system assumes:
- Fabric width is along the X-axis
- Fabric length is along the Y-axis
- Grain direction matches fabric orientation

## References

- [SVG Path Specification](https://www.w3.org/TR/SVG/paths.html)
- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG)
- Sewing pattern CAD software documentation

## Support

For issues with SVG files, check:
1. SVG file is valid (open in web browser)
2. All `<path>` elements have `data-piece-id`
3. Path `d` attribute contains valid commands
4. Custom attributes are spelled correctly
5. JSON in `data-folding-lines` is valid

---

See [phase_2_completion.md](phase_2_completion.md) for more implementation details.
