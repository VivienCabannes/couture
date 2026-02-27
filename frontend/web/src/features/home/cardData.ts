export interface CardDef {
  route: string;
  /** i18n key under the "home" namespace */
  labelKey: string;
  /** i18n key under the "home" namespace for the subtitle */
  subtitleKey: string;
  icon: string;
}

/** Core creative-flow cards (Designer → Shop → Modelist → Sewing). */
export const MAIN_CARDS: CardDef[] = [
  {
    route: "/designer",
    labelKey: "designerStudio",
    subtitleKey: "designerStudioDesc",
    icon: `<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>`,
  },
  {
    route: "/shop",
    labelKey: "patternRack",
    subtitleKey: "patternRackDesc",
    icon: `<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>`,
  },
  {
    route: "/modelist",
    labelKey: "modelistCorner",
    subtitleKey: "modelistCornerDesc",
    icon: `<path d="M4 20L20 20L4 4Z"/><line x1="4" y1="12" x2="12" y2="20"/><line x1="4" y1="16" x2="8" y2="20"/><line x1="4" y1="8" x2="16" y2="20"/>`,
  },
  {
    route: "/sewing",
    labelKey: "sewing",
    subtitleKey: "sewingDesc",
    icon: `<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12"/><path d="M20 4L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/>`,
  },
];

/** Utility/support cards (Measurements, Help). */
export const SIDE_CARDS: CardDef[] = [
  {
    route: "/measurements",
    labelKey: "measurements",
    subtitleKey: "measurementsDesc",
    icon: `<path d="M21.3 15.3a2.4 2.4 0 010 3.4l-2.6 2.6a2.4 2.4 0 01-3.4 0L2.7 8.7a2.4 2.4 0 010-3.4l2.6-2.6a2.4 2.4 0 013.4 0z"/><line x1="7" y1="7" x2="10" y2="7"/><line x1="9" y1="9" x2="12" y2="9"/><line x1="11" y1="11" x2="14" y2="11"/><line x1="13" y1="13" x2="16" y2="13"/><line x1="15" y1="15" x2="18" y2="15"/>`,
  },
  {
    route: "/help",
    labelKey: "help",
    subtitleKey: "helpDesc",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  },
];

/** All cards combined (backwards compatibility). */
export const CARDS: CardDef[] = [...MAIN_CARDS, ...SIDE_CARDS];
