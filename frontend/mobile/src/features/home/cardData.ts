import type { ReactNode } from "react";

export interface CardDef {
  /** Navigation screen name. */
  screen: string;
  /** i18n key under the "home" namespace. */
  labelKey: string;
  /** i18n key under the "home" namespace for the subtitle. */
  subtitleKey: string;
  /** Render function returning react-native-svg elements. */
  icon: () => ReactNode;
}

// Icon render functions are defined in NavigationCard to avoid importing
// react-native-svg at the data-definition level. Here we use placeholder
// functions; the actual SVG components are assembled in NavigationCard.

/** Core creative-flow cards (Designer, Shop, Modelist, Sewing). */
export const MAIN_CARDS: Omit<CardDef, "icon">[] = [
  {
    screen: "Designer",
    labelKey: "designerStudio",
    subtitleKey: "designerStudioDesc",
  },
  {
    screen: "Shop",
    labelKey: "patternRack",
    subtitleKey: "patternRackDesc",
  },
  {
    screen: "Modelist",
    labelKey: "modelistCorner",
    subtitleKey: "modelistCornerDesc",
  },
  {
    screen: "Sewing",
    labelKey: "sewing",
    subtitleKey: "sewingDesc",
  },
];

/** Utility/support cards (Measurements, Help). */
export const SIDE_CARDS: Omit<CardDef, "icon">[] = [
  {
    screen: "Measurements",
    labelKey: "measurements",
    subtitleKey: "measurementsDesc",
  },
  {
    screen: "Help",
    labelKey: "help",
    subtitleKey: "helpDesc",
  },
];

/** All cards combined. */
export const CARDS: Omit<CardDef, "icon">[] = [...MAIN_CARDS, ...SIDE_CARDS];
