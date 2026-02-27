import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";

export function DesignerPage() {
  const { t } = useTranslation();

  return (
    <>
      <BackLink />
      <PageHeading>{t("designer.title")}</PageHeading>

      <div className="flex min-h-[60vh] gap-6 max-lg:flex-col">
        {/* Left: Drawing Canvas */}
        <div className="flex-1">
          <div className="mb-3 flex gap-2">
            <ToolBtn title="Pencil">
              <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
            </ToolBtn>
            <ToolBtn title="Line">
              <line x1="5" y1="19" x2="19" y2="5" />
            </ToolBtn>
            <ToolBtn title="Curve">
              <path d="M3 20Q12 4 21 20" />
            </ToolBtn>
            <ToolBtn title="Eraser">
              <path d="M20 20H7L3 16l9-9 8 8-4 4" />
              <line x1="6" y1="20" x2="20" y2="20" />
            </ToolBtn>
          </div>
          <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
            {t("designer.drawingCanvas")}
          </div>
        </div>

        {/* Right: AI Chat */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
            <div className="ml-auto max-w-[80%] self-end rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm leading-relaxed text-white">
              {t("designer.chatBubble1")}
            </div>
            <div className="mr-auto max-w-[80%] self-start rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm leading-relaxed text-gray-900 dark:bg-gray-700 dark:text-gray-50">
              {t("designer.chatBubble2")}
            </div>
            <div className="ml-auto max-w-[80%] self-end rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm leading-relaxed text-white">
              {t("designer.chatBubble3")}
            </div>
          </div>
          <div className="flex gap-2 border-t border-gray-200 px-4 py-3 transition-colors dark:border-gray-700">
            <input
              type="text"
              placeholder={t("designer.chatPlaceholder")}
              className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-sans text-sm outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400"
            />
            <button className="cursor-pointer rounded-lg border-none bg-blue-600 px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-blue-700">
              {t("common.send")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ToolBtn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
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
