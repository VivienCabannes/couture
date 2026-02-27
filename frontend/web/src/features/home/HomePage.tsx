import { useTranslation } from "react-i18next";
import { PageHeading } from "../../components/PageHeading";
import { NavigationCard } from "./NavigationCard";
import { MAIN_CARDS, SIDE_CARDS } from "./cardData";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeading>{t("home.welcome")}</PageHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2px_1fr] gap-8">
        {/* Row 1 main */}
        <div className="lg:col-start-1 lg:row-start-1">
          <NavigationCard card={MAIN_CARDS[0]!} />
        </div>
        <div className="lg:col-start-2 lg:row-start-1">
          <NavigationCard card={MAIN_CARDS[1]!} />
        </div>

        {/* Row 2 main */}
        <div className="lg:col-start-1 lg:row-start-2">
          <NavigationCard card={MAIN_CARDS[2]!} />
        </div>
        <div className="lg:col-start-2 lg:row-start-2">
          <NavigationCard card={MAIN_CARDS[3]!} />
        </div>

        {/* Divider — spans both rows, hidden below lg */}
        <div className="hidden lg:block lg:col-start-3 lg:row-start-1 lg:row-span-2 rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Side cards */}
        <div className="lg:col-start-4 lg:row-start-1">
          <NavigationCard card={SIDE_CARDS[0]!} />
        </div>
        <div className="lg:col-start-4 lg:row-start-2">
          <NavigationCard card={SIDE_CARDS[1]!} />
        </div>
      </div>
    </>
  );
}
