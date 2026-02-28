import { useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

type Tool = "pen" | "eraser";

export function DesignerPage() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#000000");
  const [showNotice, setShowNotice] = useState(true);

  const getPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const touch = e.touches[0];
        if (!touch) return null;
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const startDraw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if ("touches" in e) e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      const pos = getPos(e);
      if (!ctx || !pos) return;
      drawingRef.current = true;
      lastPosRef.current = pos;
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    },
    [tool, color, getPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current || !lastPosRef.current) return;
      if ("touches" in e) e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      const pos = getPos(e);
      if (!ctx || !pos) return;
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPosRef.current = pos;
    },
    [getPos],
  );

  const endDraw = useCallback(() => {
    drawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <>
      {showNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowNotice(false)}
        >
          <div
            className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-amber-600 dark:stroke-amber-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-50">
              {t("designer.underDevelopment")}
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              {t("designer.underDevelopmentMessage")}
            </p>
            <button
              onClick={() => setShowNotice(false)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-[60vh] gap-6 max-lg:flex-col">
        {/* Left: Drawing Canvas */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <ToolBtn
              title={t("designer.pen")}
              active={tool === "pen"}
              onClick={() => setTool("pen")}
            >
              <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
            </ToolBtn>
            <ToolBtn
              title={t("designer.eraser")}
              active={tool === "eraser"}
              onClick={() => setTool("eraser")}
            >
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l5.7 5.7c1 1 1 2.5 0 3.4L12 21" />
              <path d="M22 21H7" />
              <path d="m5 11 9 9" />
            </ToolBtn>
            <ToolBtn title={t("designer.clear")} onClick={clearCanvas}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </ToolBtn>
            <label
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
            >
              <span
                className="block h-5 w-5 rounded-full border border-gray-300 dark:border-gray-500"
                style={{ backgroundColor: color }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full rounded-xl border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
            style={{ touchAction: "none", aspectRatio: "4 / 3", height: "auto" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* Right: Notes */}
        <div className="flex flex-1 flex-col">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
            {t("designer.notes")}
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("designer.notesPlaceholder")}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-white p-4 font-sans text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-blue-400"
            rows={12}
          />
        </div>
      </div>
    </>
  );
}

function ToolBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
        active
          ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30"
          : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-none stroke-gray-700 stroke-2 dark:stroke-gray-300"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}
