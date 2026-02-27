import { useCallback, useRef, useState } from "react";

interface Props {
  svgContent: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 10;
const ZOOM_STEP = 0.15;

export function PatternPreview({ svgContent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => clampScale(prev * (1 - Math.sign(e.deltaY) * ZOOM_STEP)));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: translate.x, origY: translate.y };
    },
    [scale, translate],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setTranslate({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const zoomIn = () => setScale((s) => clampScale(s * (1 + ZOOM_STEP)));
  const zoomOut = () => setScale((s) => clampScale(s * (1 - ZOOM_STEP)));
  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* SVG surface */}
      <div
        className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          cursor: scale > 1 ? "grab" : "default",
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-sm font-bold shadow backdrop-blur hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          className="flex h-8 items-center justify-center rounded-lg bg-white/80 px-2 text-xs font-semibold shadow backdrop-blur hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-sm font-bold shadow backdrop-blur hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>
    </div>
  );
}
