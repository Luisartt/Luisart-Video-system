// Text helpers shared by the style libraries.

/**
 * Uppercases a line for all-caps labels while keeping the channel name as "Luisart" (never
 * uppercased, CHANNEL.md rule) and @handles as written. Use it instead of CSS text-transform,
 * which cannot make exceptions.
 */
export const upperKeepName = (s: string): string =>
  s
    .split(/(\s+)/)
    .map((tok) => (tok.startsWith("@") ? tok : tok.replace(/[\p{L}\p{N}]+/gu, (w) => (/^luisart$/i.test(w) ? "Luisart" : w.toLocaleUpperCase("es")))))
    .join("");

/** Mexican number format (channel standard): 1,284.50 · 500,000 · minus sign "−". */
export const formatMx = (value: number, decimals: number): string => {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${value < 0 ? "−" : ""}${grouped}${dec ? `.${dec}` : ""}`;
};
