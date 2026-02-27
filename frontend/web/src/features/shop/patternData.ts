export interface PatternDef {
  nameKey: string;
  descKey: string;
  difficultyKey: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const PATTERNS: PatternDef[] = [
  {
    nameKey: "shop.classicBodice",
    descKey: "shop.classicBodiceDesc",
    difficultyKey: "shop.beginner",
    difficulty: "beginner",
  },
  {
    nameKey: "shop.aLineSkirt",
    descKey: "shop.aLineSkirtDesc",
    difficultyKey: "shop.beginner",
    difficulty: "beginner",
  },
  {
    nameKey: "shop.setInSleeve",
    descKey: "shop.setInSleeveDesc",
    difficultyKey: "shop.intermediate",
    difficulty: "intermediate",
  },
  {
    nameKey: "shop.shiftDress",
    descKey: "shop.shiftDressDesc",
    difficultyKey: "shop.intermediate",
    difficulty: "intermediate",
  },
  {
    nameKey: "shop.princessSeam",
    descKey: "shop.princessSeamDesc",
    difficultyKey: "shop.advanced",
    difficulty: "advanced",
  },
  {
    nameKey: "shop.corset",
    descKey: "shop.corsetDesc",
    difficultyKey: "shop.advanced",
    difficulty: "advanced",
  },
];
