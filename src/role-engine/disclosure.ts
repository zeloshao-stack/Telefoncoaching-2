import type { CharacterState, HiddenFact, Observation, RoleCharacter } from "./types";

/**
 * Verdeckte Fakten bleiben zu, wenn die Figur unter Druck oder im Rückzug ist.
 * Keyword allein reicht nicht — sonst wird sie zur FAQ.
 */
export function disclosureHeldBack(state?: CharacterState): boolean {
  if (!state) return false;
  const process = state.affect?.process;
  if (process === "withdrawal" || process === "reactance") return true;
  if (state.salesPressure >= 55) return true;
  if (state.irritation >= 62) return true;
  return false;
}

export function proposeDisclosures(
  character: RoleCharacter,
  observations: Observation[],
  hiddenFacts: HiddenFact[],
  state?: CharacterState,
): string[] {
  if (disclosureHeldBack(state)) return [];

  const proposed: string[] = [];
  const text = observations.map((o) => o.evidence.toLowerCase()).join(" ");

  for (const fact of hiddenFacts) {
    if (fact.status !== "private") continue;
    if (fact.disclosureSensitivity === "high" && (state?.trust ?? 100) < 40) continue;
    if (fact.id === "competitor_scope") {
      if (
        observations.some((o) => o.type === "asked_specific_question") &&
        /(leistung|umfang|angebot|unterschied|vergleich|worin)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "sister_concern") {
      if (
        observations.some((o) => o.type === "clarified_decision_authority" || o.type === "asked_specific_question") &&
        /(schwester|beide|bindungs|entscheid|was müsste)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "wellbeing") {
      if (
        observations.some((o) => o.type === "asked_specific_question" || o.type === "acknowledged_concern") &&
        /(wie geht|fühlen|stimmung|befind|müde)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "sell_will") {
      if (
        observations.some(
          (o) => o.type === "asked_specific_question" || o.type === "clarified_decision_authority",
        ) &&
        /(verkaufen|verkaufswill|wollen sie|beschlossen|im verkauf|partner|kündigen|wechseln|unterschreib|allein|wer muss mit|wer entscheid)/.test(
          text,
        )
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "prior_talk") {
      if (
        observations.some((o) => o.type === "asked_specific_question") &&
        /(gesprochen|anderer makler|schon jemand|angeboten|wer noch|bank|plattform|werberate|werkstatt)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "son_ease") {
      if (
        observations.some((o) => o.type === "clarified_decision_authority" || o.type === "asked_specific_question") &&
        /(sohn|thomas|familie|wer mit)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "constitution") {
      if (
        observations.some((o) => o.type === "asked_specific_question" || o.type === "acknowledged_concern") &&
        /(gesundheit|treppe|körper|verfassung|kraft|stiegen)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "board_ban") {
      if (
        observations.some((o) => o.type === "asked_specific_question") &&
        /(beirat|namensliste|warum .{0,24}(keine|nicht).{0,12}namen|untersagt|verboten.{0,20}namen)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "sister_in_law_block") {
      if (
        observations.some((o) => o.type === "asked_specific_question" || o.type === "clarified_decision_authority") &&
        /(block|wer ist dagegen|wer hat nein|warum .{0,28}nicht durch|sonderumlage|schwägerin)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "lawyer_warning") {
      if (
        observations.some((o) => o.type === "asked_specific_question") &&
        /(anwalt|rechtsanwalt|rechtliche beratung|schon .{0,16}gefragt|woher .{0,20}(unsicher|heikel)|gerhard)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "prior_broker") {
      if (
        observations.some((o) => o.type === "asked_specific_question") &&
        /(früher|schlechte erfahrung|letzter makler|schon (mal )?einen|warum .{0,20}(sorge|diese frage)|schon gebunden|letzte vollmacht)/.test(
          text,
        )
      ) {
        proposed.push(fact.id);
      }
    }
    if (fact.id === "neighbor_quiet") {
      if (
        observations.some((o) => o.type === "asked_specific_question") &&
        /(darf ich|erlaubnis|einverstanden|kontakt(ieren)?|nachbarin anrufen|weitergeben)/.test(text) &&
        !/(wie heißt|adresse|wo wohnt|ich geh(e)? rüber)/.test(text)
      ) {
        proposed.push(fact.id);
      }
    }
  }

  return proposed;
}

export function commitDisclosures(hiddenFacts: HiddenFact[], proposedIds: string[]): HiddenFact[] {
  return hiddenFacts.map((f) =>
    proposedIds.includes(f.id) ? { ...f, status: "disclosed" as const } : f,
  );
}
