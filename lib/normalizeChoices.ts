export type ChoiceLetter = 'A' | 'B' | 'C' | 'D';

export function normalizeChoices(
  choices: any
): Array<{ key: ChoiceLetter; text: string }> {
  // OBJECT form: { A: "...", B: "...", ... }
  if (choices && typeof choices === 'object' && !Array.isArray(choices)) {
    const entries = Object.entries(choices) as Array<[string, any]>;
    const out = entries
      .filter(([k]) => ['A', 'B', 'C', 'D'].includes(String(k)))
      .map(([k, v]) => ({ key: k as ChoiceLetter, text: String(v) }));

    // keep A-D order if present
    const order: ChoiceLetter[] = ['A', 'B', 'C', 'D'];
    out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    return out;
  }

  // ARRAY form: ["...", "...", ...] -> map to A,B,C,D...
  if (Array.isArray(choices)) {
    return choices.map((c, idx) => ({
      key: String.fromCharCode(65 + idx) as ChoiceLetter,
      text: String(c),
    }));
  }

  return [];
}
