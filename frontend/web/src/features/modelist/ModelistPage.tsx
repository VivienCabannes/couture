import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";

export function ModelistPage() {
  const { t } = useTranslation();

  return (
    <>
      <BackLink />
      <PageHeading>{t("modelist.title")}</PageHeading>

      <div className="flex min-h-[60vh] gap-6 max-lg:flex-col">
        {/* Left: SVG Viewport (60%) */}
        <div className="flex-[3]">
          <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
            <svg
              viewBox="0 0 300 400"
              className="max-w-[400px]"
              width="100%"
              height="100%"
            >
              <path
                className="fill-none stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="1.5"
                d="M50 20 Q80 10 100 15 L110 15 Q140 10 160 25 L170 80 Q165 120 175 160 L180 200 Q150 210 100 210 Q60 210 40 200 L50 160 Q45 120 50 80 Z"
              />
              <path
                className="fill-none stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                d="M100 210 L95 150 L105 150 Z"
              />
              <line
                className="fill-none stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="1.5"
                strokeDasharray="8 4"
                x1="110"
                y1="40"
                x2="110"
                y2="190"
              />
              <polygon
                className="fill-none stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="1.5"
                points="110,35 107,42 113,42"
              />
              <polygon
                className="fill-none stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="1.5"
                points="110,195 107,188 113,188"
              />
              <text
                x="110"
                y="120"
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
                fontFamily="Inter, sans-serif"
              >
                {t("modelist.frontBodice")}
              </text>
            </svg>
            <div className="absolute right-3 bottom-3 flex gap-1">
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-base font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                +
              </button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-base font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                &minus;
              </button>
            </div>
          </div>
        </div>

        {/* Right: Controls (40%) */}
        <div className="flex flex-[2] flex-col gap-2">
          {/* Adjustments */}
          <details
            open
            className="overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 p-3 px-4 text-sm font-semibold text-gray-900 transition-colors dark:text-gray-50">
              <span className="inline-block transition-transform [[open]>&]:rotate-90">
                &#9656;
              </span>
              {t("modelist.adjustments")}
            </summary>
            <div className="px-4 pb-4">
              <ControlRow label={t("modelist.ease")} defaultValue={4} step={0.5} />
              <ControlRow label={t("modelist.seamAllowance")} defaultValue={1} step={0.5} />
              <ControlRow label={t("modelist.hemAllowance")} defaultValue={2} step={0.5} />
            </div>
          </details>

          {/* Dart Controls */}
          <details className="overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-3 px-4 text-sm font-semibold text-gray-900 transition-colors dark:text-gray-50">
              <span className="inline-block transition-transform [[open]>&]:rotate-90">
                &#9656;
              </span>
              {t("modelist.dartControls")}
            </summary>
            <div className="px-4 pb-4">
              <ControlRow label={t("modelist.dartAngle")} defaultValue={12} step={1} max={90} />
              <ControlRow label={t("modelist.dartLength")} defaultValue={8} step={0.5} />
            </div>
          </details>

          {/* AI Assistant */}
          <details className="overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-3 px-4 text-sm font-semibold text-gray-900 transition-colors dark:text-gray-50">
              <span className="inline-block transition-transform [[open]>&]:rotate-90">
                &#9656;
              </span>
              {t("modelist.aiAssistant")}
            </summary>
            <div className="px-4 pb-4">
              <p className="mb-3 text-[0.8125rem] text-gray-500">
                {t("modelist.aiDescription")}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("modelist.aiPlaceholder")}
                  className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-sans text-[0.8125rem] outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400"
                />
                <button className="cursor-pointer rounded-lg border-none bg-blue-600 px-3.5 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-blue-700">
                  {t("modelist.apply")}
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </>
  );
}

function ControlRow({
  label,
  defaultValue,
  step,
  max,
}: {
  label: string;
  defaultValue: number;
  step: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[0.8125rem] text-gray-700 dark:text-gray-300">
      <label className="flex-1">{label}</label>
      <input
        type="number"
        defaultValue={defaultValue}
        step={step}
        min={0}
        max={max}
        className="w-[72px] rounded-md border border-gray-300 bg-transparent px-2 py-1 text-right font-sans text-[0.8125rem] outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400"
      />
    </div>
  );
}
