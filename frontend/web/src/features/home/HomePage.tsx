import { useTranslation } from "react-i18next";
import { PageHeading } from "../../components/PageHeading";
import { NavigationCard } from "./NavigationCard";
import { CARDS } from "./cardData";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeading>{t("home.welcome")}</PageHeading>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <NavigationCard key={card.route} card={card} />
        ))}
      </div>
    </>
  );
}
