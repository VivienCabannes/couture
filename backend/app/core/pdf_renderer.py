"""Lightweight PDF renderer for sewing patterns using fpdf2.

Same drawing interface as SVGRenderer, backed by fpdf2 for accurate
physical-unit (cm) output suitable for 1:1 printing.
"""

import io

import numpy as np
from fpdf import FPDF


class PDFRenderer:
    """Accumulates drawing primitives and emits a PDF document."""

    DASH_PATTERNS = {
        '-': None,
        '--': (2, 1),    # 2mm on, 1mm off
        ':': (0.5, 0.5),
        '-.': (2, 0.5, 0.5, 0.5),
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

        width_cm = self.max_x - self.min_x
        height_cm = self.max_y - self.min_y

        self.pdf = FPDF(unit='cm', format=(width_cm, height_cm))
        self.pdf.add_page()
        self.pdf.set_auto_page_break(auto=False)

        if title:
            self.pdf.set_font('Helvetica', 'B', 10)
            self.pdf.set_xy(0, 0.5)
            self.pdf.cell(width_cm, 0.5, title, align='C')

    # -- coordinate helpers ---------------------------------------------------

    def _tx(self, x):
        return x - self.min_x

    def _ty(self, y):
        if self.y_flip:
            return self.max_y - y
        else:
            return y - self.min_y

    def _set_dash(self, style):
        dash = self.DASH_PATTERNS.get(style)
        if dash:
            self.pdf.set_dash_pattern(dash=dash[0], gap=dash[1])
        else:
            self.pdf.set_dash_pattern()

    @staticmethod
    def _parse_color(color):
        COLORS = {
            'black': (0, 0, 0),
            'blue': (0, 0, 255),
            'green': (0, 128, 0),
            'red': (255, 0, 0),
            'gray': (128, 128, 128),
            'grey': (128, 128, 128),
        }
        return COLORS.get(color, (0, 0, 0))

    # -- drawing primitives ---------------------------------------------------

    def line(self, x1, y1, x2, y2, color='black', style='-', width=1):
        """Draw a line from (x1, y1) to (x2, y2)."""
        r, g, b = self._parse_color(color)
        self.pdf.set_draw_color(r, g, b)
        self.pdf.set_line_width(width * 0.03)
        self._set_dash(style)
        self.pdf.line(self._tx(x1), self._ty(y1), self._tx(x2), self._ty(y2))
        self._set_dash('-')

    def polyline(self, points, color='black', style='-', width=1):
        """Draw a polyline through a sequence of (x, y) points."""
        if len(points) < 2:
            return
        for i in range(len(points) - 1):
            self.line(points[i][0], points[i][1],
                      points[i + 1][0], points[i + 1][1],
                      color=color, style=style, width=width)

    def bezier(self, p0, p1, p2, p3, color='black', style='-', width=1):
        """Draw a cubic Bezier curve by sampling points."""
        r, g, b = self._parse_color(color)
        self.pdf.set_draw_color(r, g, b)
        self.pdf.set_line_width(width * 0.03)
        self._set_dash(style)

        num = 64
        t = np.linspace(0, 1, num)
        pts = (np.outer((1 - t)**3, p0) +
               np.outer(3 * (1 - t)**2 * t, p1) +
               np.outer(3 * (1 - t) * t**2, p2) +
               np.outer(t**3, p3))

        for i in range(num - 1):
            self.pdf.line(self._tx(pts[i, 0]), self._ty(pts[i, 1]),
                          self._tx(pts[i + 1, 0]), self._ty(pts[i + 1, 1]))

        self._set_dash('-')

    def circle(self, x, y, r, color='black'):
        """Draw a filled circle at (x, y) with radius r."""
        rc, gc, bc = self._parse_color(color)
        self.pdf.set_fill_color(rc, gc, bc)
        sx, sy = self._tx(x), self._ty(y)
        self.pdf.ellipse(sx - r, sy - r, r * 2, r * 2, style='F')

    def text(self, x, y, content, size=8, color='black', ha='left', fontweight='normal'):
        """Draw text at (x, y) with the given size and alignment."""
        rc, gc, bc = self._parse_color(color)
        self.pdf.set_text_color(rc, gc, bc)
        style = 'B' if fontweight == 'bold' else ''
        self.pdf.set_font('Helvetica', style, size)

        sx, sy = self._tx(x), self._ty(y)
        lines = str(content).split('\n')
        line_height = size * 0.04  # approximate cm per line

        for i, line_text in enumerate(lines):
            ly = sy + i * line_height
            tw = self.pdf.get_string_width(line_text)
            if ha == 'center':
                lx = sx - tw / 2
            elif ha == 'right':
                lx = sx - tw
            else:
                lx = sx
            self.pdf.text(lx, ly, line_text)

    # -- output ---------------------------------------------------------------

    def to_pdf(self) -> bytes:
        """Render and return the PDF document as bytes."""
        buf = io.BytesIO()
        self.pdf.output(buf)
        buf.seek(0)
        return buf.read()
