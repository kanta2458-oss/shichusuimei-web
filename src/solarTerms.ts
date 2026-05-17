export interface SolarTermStart {
  month: number;
  day: number;
  hour: number;
  minute: number;
}

type BranchSolarTerms = Partial<Record<string, SolarTermStart>>;

function term(month: number, day: number, hour: number, minute: number): SolarTermStart {
  return { month, day, hour, minute };
}

export const SOLAR_TERM_MONTH_STARTS: Record<number, BranchSolarTerms> = {
  1997: {
    丑: term(1, 5, 22, 20),
    寅: term(2, 4, 4, 3),
    卯: term(3, 5, 22, 5),
    辰: term(4, 5, 2, 57),
    巳: term(5, 5, 20, 21),
    午: term(6, 6, 0, 34),
    未: term(7, 7, 10, 51),
    申: term(8, 7, 20, 38),
    酉: term(9, 7, 23, 30),
    戌: term(10, 8, 15, 7),
    亥: term(11, 7, 18, 16),
    子: term(12, 7, 11, 6)
  },
  1998: {
    丑: term(1, 6, 4, 19),
    寅: term(2, 4, 9, 58),
    卯: term(3, 6, 3, 59),
    辰: term(4, 5, 8, 46),
    巳: term(5, 6, 2, 4),
    午: term(6, 6, 6, 15),
    未: term(7, 7, 16, 32),
    申: term(8, 8, 2, 21),
    酉: term(9, 8, 5, 17),
    戌: term(10, 8, 20, 57),
    亥: term(11, 8, 0, 10),
    子: term(12, 7, 17, 3)
  },
  1999: {
    丑: term(1, 6, 10, 2),
    寅: term(2, 4, 15, 58),
    卯: term(3, 6, 9, 59),
    辰: term(4, 5, 14, 46),
    巳: term(5, 6, 8, 2),
    午: term(6, 6, 12, 10),
    未: term(7, 7, 22, 26),
    申: term(8, 8, 8, 15),
    酉: term(9, 8, 11, 11),
    戌: term(10, 9, 2, 50),
    亥: term(11, 8, 5, 59),
    子: term(12, 7, 22, 49)
  },
  2000: {
    丑: term(1, 5, 15, 52),
    寅: term(2, 4, 21, 42),
    卯: term(3, 5, 15, 44),
    辰: term(4, 4, 20, 33),
    巳: term(5, 5, 13, 51),
    午: term(6, 5, 18, 0),
    未: term(7, 7, 4, 15),
    申: term(8, 7, 14, 4),
    酉: term(9, 7, 17, 1),
    戌: term(10, 8, 8, 40),
    亥: term(11, 7, 11, 50),
    子: term(12, 7, 4, 39)
  },
  2001: {
    丑: term(1, 5, 21, 45),
    寅: term(2, 4, 3, 31),
    卯: term(3, 5, 21, 34),
    辰: term(4, 5, 2, 24),
    巳: term(5, 5, 19, 46),
    午: term(6, 5, 23, 58),
    未: term(7, 7, 10, 14),
    申: term(8, 7, 20, 3),
    酉: term(9, 7, 22, 56),
    戌: term(10, 8, 14, 34),
    亥: term(11, 7, 17, 43),
    子: term(12, 7, 10, 32)
  },
  2002: {
    丑: term(1, 6, 3, 35),
    寅: term(2, 4, 9, 24),
    卯: term(3, 6, 3, 27),
    辰: term(4, 5, 8, 17),
    巳: term(5, 6, 1, 38),
    午: term(6, 6, 5, 49),
    未: term(7, 7, 16, 6),
    申: term(8, 8, 1, 54),
    酉: term(9, 8, 4, 47),
    戌: term(10, 8, 20, 23),
    亥: term(11, 7, 23, 32),
    子: term(12, 7, 16, 22)
  }
};

export function getSolarTermStart(year: number, branch: string): SolarTermStart | undefined {
  return SOLAR_TERM_MONTH_STARTS[year]?.[branch];
}
