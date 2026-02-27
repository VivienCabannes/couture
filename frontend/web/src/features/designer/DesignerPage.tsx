import { useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";

type Tool = "pen" | "eraser";

export function DesignerPage() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [drawing, setDrawing] = useState(false);
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#000000");

  const getPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const touch = e.touches[0]!;
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
      const ctx = canvasRef.current?.getContext("2d");
      const pos = getPos(e);
      if (!ctx || !pos) return;
      setDrawing(true);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
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
      if (!drawing) return;
      const ctx = canvasRef.current?.getContext("2d");
      const pos = getPos(e);
      if (!ctx || !pos) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [drawing, getPos],
  );

  const endDraw = useCallback(() => {
    setDrawing(false);
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
      <BackLink />
      <PageHeading>{t("designer.title")}</PageHeading>

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
              <path d="M20 20H7L3 16l9-9 8 8-4 4" />
              <line x1="6" y1="20" x2="20" y2="20" />
            </ToolBtn>
            <ToolBtn title={t("designer.clear")} onClick={clearCanvas}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </ToolBtn>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-gray-300 bg-transparent p-0.5 dark:border-gray-600"
            />
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full rounded-xl border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
            style={{ touchAction: "none" }}
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
        className="h-4 w-4 fill-none stroke-gray-700 stroke-2 dark:stroke-gray-300"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}
