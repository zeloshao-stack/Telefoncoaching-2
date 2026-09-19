/**
 * Teilt eine Antwort in sprechbare Sätze, damit der erste Satz schon läuft,
 * während die weiteren noch geladen werden. Sehr kurze Stücke werden an den
 * Vorgänger gehängt, damit die Stimme nicht stottert.
 */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const parts = cleaned
    .split(/(?<=[.!?…])\s+(?=[A-ZÄÖÜ„"(])/)
    .map((part) => part.trim())
    .filter(Boolean);
  const merged: string[] = [];
  for (const part of parts) {
    const prev = merged[merged.length - 1];
    if (prev && (part.split(" ").length < 3 || prev.split(" ").length < 3)) {
      merged[merged.length - 1] = `${prev} ${part}`;
    } else {
      merged.push(part);
    }
  }
  return merged.length ? merged : [cleaned];
}
