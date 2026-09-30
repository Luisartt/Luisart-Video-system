// The example figures, in ONE place, for every version of this short (Terminal v3 and Pizarra):
// the board cards, the takeaway rows and the captions all read from here.
//
// Company B is pending with the user: the recording says "vale 10" (10 ÷ 2 = 5, and then the line
// "aunque el precio diga lo contrario" holds), the script says 100 (100 ÷ 2 = 50, matching the
// "su múltiplo es 50" that was said). Change `B.price` (and/or `B.eps`) here and everything —
// numbers, P/U, the caption that shows the price — follows. P/U is always computed, never typed.

export type Company = { price: number; eps: number };

export const A: Company = { price: 20, eps: 10 };
export const B: Company = { price: 100, eps: 2 };

/** Price-to-earnings multiple, rounded to 1 decimal only if it isn't whole. */
export const pu = (c: Company) => {
  const v = c.price / c.eps;
  return Number.isInteger(v) ? v : Math.round(v * 10) / 10;
};

/** "$20", "$100" */
export const money = (n: number) => `$${n}`;
/** "2", "50", "7,5" (Spanish decimal comma) */
export const num = (n: number) => String(n).replace(".", ",");

/** Subtle label on every example figure (rule j): sample data, money in Mexican pesos. */
export const EXAMPLE_LABEL = "dato de ejemplo · MXN";
