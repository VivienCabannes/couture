import { useTranslation } from "react-i18next";
import { ScreenWrapper, PageHeading } from "../../components";
import { HelpContent } from "./HelpContent";

export function HelpScreen() {
  const { t } = useTranslation();

  return (
    <ScreenWrapper>
      <PageHeading>{t("help.title")}</PageHeading>
      <HelpContent />
    </ScreenWrapper>
  );
}
