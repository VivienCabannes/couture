import { TableOfContents } from "./TableOfContents";
import { HelpContent } from "./HelpContent";

export function HelpPage() {
  return (
    <>
      <div className="flex gap-10 max-md:flex-col">
        <TableOfContents />
        <HelpContent />
      </div>
    </>
  );
}
