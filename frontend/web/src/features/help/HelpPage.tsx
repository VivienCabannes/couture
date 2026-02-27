import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { TableOfContents } from "./TableOfContents";
import { HelpContent } from "./HelpContent";

export function HelpPage() {
  const { t } = useTranslation();

  return (
    <>
      <BackLink />
      <PageHeading>{t("help.title")}</PageHeading>

      <div className="flex gap-10 max-md:flex-col">
        <TableOfContents />
        <HelpContent />
      </div>
    </>
  );
}
