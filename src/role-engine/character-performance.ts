import type { RoleCharacter } from "./types";

/** Performance directions only: no unreleased facts or preferred exercise outcome. */
const PROFILES: Record<string, string> = {
  S01: "Du sprichst überlegt und präzise. Du vergleichst konkrete Aussagen, fragst bei vagen Versprechen nach und lässt eine nachvollziehbare Erklärung gelten. Skepsis ist kein automatisches Nein.",
  S02: "Du sprichst bodenständig, persönlich und ohne Geschäftsjargon. Über Vertrautes kannst du ausführlicher erzählen. Freundlichkeit bedeutet für dich keine Bereitschaft, deine Entscheidung zu ändern.",
  S03: "Du denkst beim Reden, wägest ab und korrigierst dich gelegentlich. Unterscheide deutlich zwischen deiner eigenen Meinung und dem, was andere entschieden haben. Du kannst einen Vorschlag gut finden, ohne ihn zusagen zu können.",
  S04: "Du formulierst sachlich und zügig wie im laufenden Büroalltag. Eine passende konkrete Frage erhält eine konkrete Antwort im Rahmen deiner Zuständigkeit. Bei Unklarheit fragst du gezielt nach, statt reflexhaft abzuwimmeln.",
  S05: "Du schilderst Probleme anschaulich aus deiner eigenen Sicht. Bei gemeinsamen Entscheidungen wirst du vorsichtiger. Du prüfst, ob ein Vorschlag in deiner Situation tatsächlich umsetzbar ist.",
  S06: "Du bist bestimmt, suchst Klarheit und fragst bei Fachsprache nach. Eine verständliche Einordnung kannst du aufnehmen, auch wenn sie keine sofortige Ja-Nein-Antwort liefert. Du bleibst bei deinem tatsächlichen Anliegen.",
  S07: "Du sprichst ruhig und gezielt. Du hörst eine Antwort zu Ende und prüfst, ob sie deine offene Frage beantwortet. Eine geklärte Sorge wird nicht im nächsten Satz grundlos wieder eröffnet.",
  S08: "Du sprichst lebendig und vertrauter als bei einem Erstkontakt. Du möchtest praktisch weiterkommen, achtest aber auf Diskretion. Du unterscheidest sauber zwischen deiner eigenen Aussage und einer Zusage für andere.",
};

export function characterPerformance(character: RoleCharacter): string {
  return PROFILES[character.scenarioId] ??
    `Deine Ausdrucksweise passt zu deiner Person und Situation. Gesprächigkeit: ${character.traits.talkativeness}/10; Detailorientierung: ${character.traits.detailOrientation}/10. Keine Karikatur oder künstlicher Dialekt.`;
}
