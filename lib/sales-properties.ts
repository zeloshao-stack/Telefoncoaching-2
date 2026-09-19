export type SalesDomain =
  | "objekt"
  | "entscheidung"
  | "kommerziell"
  | "einwand"
  | "naechster"
  | "einstieg"
  | "folge"
  | "service";

export type SalesProperty = {
  id: string;
  domain: SalesDomain;
  label: string;
  coachUse: string;
  contraindication: string;
};

export function salesPropertiesForQuestion(question: string, catalog: SalesProperty[]): SalesProperty[] {
  if (catalog.length === 0) return [];
  const q = question.toLowerCase();
  const scored = catalog.map((prop) => {
    const hay = `${prop.label} ${prop.coachUse} ${prop.domain} ${prop.id}`.toLowerCase();
    let n = 0;
    for (const word of q.split(/[^\p{L}0-9]+/u).filter((w) => w.length > 3)) {
      if (hay.includes(word)) n += 1;
    }
    if (/honorar|prämie|praemie|leistung|umfang|vergleich|36|48/.test(q) && prop.id === "P-vergleich") n += 5;
    if (/schwester|vollmacht|miteigent|entscheid|unterschrift|beirat/.test(q) && prop.id === "P-vollmacht") n += 5;
    if (/absage|nicht verkaufen|keine anrufe|grenze|kündigen/.test(q) && prop.id === "P-absage") n += 5;
    if (/käufer|beleg|wahr|erfind|nachfrage/.test(q) && prop.id === "P-beleg") n += 5;
    if (/abschluss|verbind|nächster|next|reservier/.test(q) && prop.id === "P-schritt") n += 4;
    if (/lage|fassade|zinshaus|wallner|objekt/.test(q) && prop.id === "P-lage") n += 4;
    if (/bedarf|police|deckung|haushaltsversicherung/.test(q) && prop.id === "P-bedarf") n += 4;
    if (/tragbar|rate|kredit/.test(q) && prop.id === "P-tragbarkeit") n += 4;
    if (/einstieg|eröffn|kaltakquise|erstgespräch|erstkontakt|anlass/.test(q) && prop.id === "P-erlaubnis") n += 5;
    if (/nachfass|reaktiv|verloren|konkurrenz|kunde ist weg/.test(q) && prop.id === "P-folge") n += 5;
    if (/schaden|betriebskosten|frist|professionist|beschwerde/.test(q) && (prop.id === "P-sachverhalt" || prop.id === "P-frist")) n += 5;
    return { prop, n };
  });
  scored.sort((a, b) => b.n - a.n);
  const picked = scored.filter((s) => s.n > 0).slice(0, 3).map((s) => s.prop);
  return picked.length > 0 ? picked : catalog.slice(0, 2);
}

export function formatSalesProperties(props: SalesProperty[]): string {
  return props
    .map((p) => `${p.id} · ${p.label}: ${p.coachUse} Nicht: ${p.contraindication}`)
    .join("\n");
}
