"""Lightweight SVG renderer for sewing patterns.

Provides a drawing API that assembles native SVG elements, replacing matplotlib
for pattern output. Coordinates are in cm; the SVG uses mm units for correct
physical sizing when printed.
"""

CM_TO_MM = 10.0


def _mm(v):
    return v * CM_TO_MM


def _fmt(v):
    return f"{v:.2f}"


class SVGRenderer:
    """Accumulates drawing primitives and emits a complete SVG document."""

    STROKE_DASHARRAY = {
        '-': None,
        '--': '5,3',
        ':': '2,2',
        '-.': '5,2,2,2',
    }

    def __init__(self, bounds, *, y_flip=False, title=None):
        """Initialize the renderer.

        Args:
            bounds: (min_x, max_x, min_y, max_y) in cm.
            y_flip: If True, flip the y-axis (mathematical coords, y up).
                    If False, y increases downward (screen coords).
            title: Optional title string rendered at the top.
        """
        self.min_x, self.max_x, self.min_y, self.max_y = bounds
        self.y_flip = y_flip
        self.title = title
        self._elements: list[str] = []

    # -- coordinate helpers ---------------------------------------------------

    def _tx(self, x):
        """Transform x from pattern cm to SVG mm."""
        return _mm(x - self.min_x)

    def _ty(self, y):
        """Transform y from pattern cm to SVG mm."""
        if self.y_flip:
            return _mm(self.max_y - y)
        else:
            return _mm(y - self.min_y)

    def _pt(self, x, y):
        return self._tx(x), self._ty(y)

    # -- drawing primitives ---------------------------------------------------

    def line(self, x1, y1, x2, y2, color='black', style='-', width=1):
        """Draw a line from (x1, y1) to (x2, y2)."""
        sx1, sy1 = self._pt(x1, y1)
        sx2, sy2 = self._pt(x2, y2)
        dash = self.STROKE_DASHARRAY.get(style)
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        self._elements.append(
            f'<line x1="{_fmt(sx1)}" y1="{_fmt(sy1)}" '
            f'x2="{_fmt(sx2)}" y2="{_fmt(sy2)}" '
            f'stroke="{color}" stroke-width="{_fmt(_mm(width * 0.03))}" '
            f'fill="none"{dash_attr}/>'
        )

    def polyline(self, points, color='black', style='-', width=1):
        """Draw a polyline through a sequence of (x, y) points."""
        pts_str = ' '.join(f'{_fmt(self._tx(x))},{_fmt(self._ty(y))}' for x, y in points)
        dash = self.STROKE_DASHARRAY.get(style)
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        self._elements.append(
            f'<polyline points="{pts_str}" '
            f'stroke="{color}" stroke-width="{_fmt(_mm(width * 0.03))}" '
            f'fill="none"{dash_attr}/>'
        )

    def bezier(self, p0, p1, p2, p3, color='black', style='-', width=1):
        """Draw a cubic Bezier curve as a native SVG path."""
        sx0, sy0 = self._pt(p0[0], p0[1])
        sx1, sy1 = self._pt(p1[0], p1[1])
        sx2, sy2 = self._pt(p2[0], p2[1])
        sx3, sy3 = self._pt(p3[0], p3[1])
        dash = self.STROKE_DASHARRAY.get(style)
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        d = (f'M {_fmt(sx0)},{_fmt(sy0)} '
             f'C {_fmt(sx1)},{_fmt(sy1)} {_fmt(sx2)},{_fmt(sy2)} {_fmt(sx3)},{_fmt(sy3)}')
        self._elements.append(
            f'<path d="{d}" stroke="{color}" stroke-width="{_fmt(_mm(width * 0.03))}" '
            f'fill="none"{dash_attr}/>'
        )

    def circle(self, x, y, r, color='black'):
        """Draw a filled circle at (x, y) with radius r."""
        sx, sy = self._pt(x, y)
        self._elements.append(
            f'<circle cx="{_fmt(sx)}" cy="{_fmt(sy)}" r="{_fmt(_mm(r))}" '
            f'fill="{color}"/>'
        )

    def text(self, x, y, content, size=8, color='black', ha='left', fontweight='normal'):
        """Draw text at (x, y) with the given size and alignment."""
        sx, sy = self._pt(x, y)
        anchor_map = {'left': 'start', 'center': 'middle', 'right': 'end'}
        anchor = anchor_map.get(ha, 'start')
        weight_attr = f' font-weight="bold"' if fontweight == 'bold' else ''
        # Escape XML entities
        content = str(content).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        # Handle multi-line text
        lines = content.split('\n')
        if len(lines) == 1:
            self._elements.append(
                f'<text x="{_fmt(sx)}" y="{_fmt(sy)}" '
                f'font-family="Arial, sans-serif" font-size="{_fmt(_mm(size * 0.035))}" '
                f'fill="{color}" text-anchor="{anchor}"{weight_attr}>{content}</text>'
            )
        else:
            parts = [f'<text x="{_fmt(sx)}" y="{_fmt(sy)}" '
                     f'font-family="Arial, sans-serif" font-size="{_fmt(_mm(size * 0.035))}" '
                     f'fill="{color}" text-anchor="{anchor}"{weight_attr}>']
            for i, line in enumerate(lines):
                dy = '0' if i == 0 else '1.2em'
                parts.append(f'<tspan x="{_fmt(sx)}" dy="{dy}">{line}</tspan>')
            parts.append('</text>')
            self._elements.append(''.join(parts))

    # -- output ---------------------------------------------------------------

    def to_svg(self) -> str:
        """Render and return the complete SVG document as a string."""
        width_mm = _mm(self.max_x - self.min_x)
        height_mm = _mm(self.max_y - self.min_y)
        header = (
            f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {_fmt(width_mm)} {_fmt(height_mm)}">\n'
        )
        body = '\n'.join(f'  {el}' for el in self._elements)
        footer = '\n</svg>\n'
        return header + body + footer
