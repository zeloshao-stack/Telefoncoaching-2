import { hydrateAffect, spokenWithAffect } from "./affect";
import { brushOffLine, hangupPolicy, withHangup } from "./hangup";
import type { HiddenFact, Observation, RoleCharacter, RolePlayerAction, TranscriptTurn } from "./types";
import type { CharacterState } from "./types";

function factText(facts: HiddenFact[], id: string) {
  return facts.find((f) => f.id === id)?.fact;
}

export function mockRolePlay(args: {
  sessionId: string;
  turnId: string;
  character: RoleCharacter;
  hiddenFacts: HiddenFact[];
  state: CharacterState;
  observations: Observation[];
  proposedDisclosures: string[];
  traineeText: string;
  /** Bisheriger Verlauf — zählt Abwimmelversuche für die Auflege-Politik. */
  transcript?: TranscriptTurn[];
}): RolePlayerAction {
  const { sessionId, turnId, character, hiddenFacts, state, observations, proposedDisclosures, traineeText } =
    args;
  const types = new Set(observations.map((o) => o.type));
  const lower = traineeText.toLowerCase();

  const colored = (utterance: string) => spokenWithAffect(utterance, hydrateAffect(character, state));

  const speak = (utterance: string, extra?: Partial<RolePlayerAction>): RolePlayerAction => ({
    sessionId,
    turnId,
    expectedStateRevision: state.stateRevision,
    action: "speak",
    utterance: colored(utterance),
    state,
    observations,
    proposedDisclosures,
    ...extra,
  });

  const end = (
    utterance: string,
    endReason: NonNullable<RolePlayerAction["endReason"]>,
    trigger?: string,
  ): RolePlayerAction => ({
    sessionId,
    turnId,
    expectedStateRevision: state.stateRevision,
    action: "end_call",
    utterance: colored(utterance),
    state: { ...withHangup(state, endReason, trigger), status: "ending" },
    observations,
    proposedDisclosures,
    endReason,
  });

  const policy = hangupPolicy(character, state, {
    observations,
    prior: (args.transcript ?? []).map((t) => ({ speaker: t.speaker, text: t.text })),
    traineeText,
  });

  if (character.scenarioId === "S02") {
    if (types.has("respected_no") && !types.has("continued_after_final_no")) {
      return end("Gut. Dann ist das erledigt. Bitte rufen Sie nicht mehr an. Auf Wiederhören.", "final_no");
    }
    if (types.has("ignored_boundary") || types.has("continued_after_final_no")) {
      return end("Nein. Ich will das nicht. Ich lege auf.", "boundary_ignored");
    }
    if (policy.shouldHangUp) {
      return end(policy.closingLine, policy.reason ?? "character_choice", policy.trigger);
    }
    return speak(brushOffLine(character, policy.brushOffsSoFar) || "Nein.");
  }

  if (types.has("interrupted_character") && types.size === 1) {
    return speak("Lassen Sie mich ausreden. Was wollten Sie sagen?");
  }

  // Auflegen ist eine echte Konsequenz — Kaltakquise früher, Bestandskontakt später.
  if (policy.shouldHangUp) {
    return end(policy.closingLine, policy.reason ?? "character_choice", policy.trigger);
  }

  // Kaltakquise ohne Grund: erst abwimmeln, dann (siehe oben) auflegen.
  if (
    policy.context === "cold" &&
    !policy.reasonGiven &&
    !policy.askedForTime &&
    !proposedDisclosures.length &&
    !types.has("asked_specific_question") &&
    !types.has("clarified_decision_authority")
  ) {
    return speak(brushOffLine(character, policy.brushOffsSoFar));
  }

  if (character.scenarioId === "S03") {
    if (types.has("premature_close") || /auftrag|bestätigung/.test(lower)) {
      return speak(
        "Halt, so nicht. Ich persönlich könnte mir das vorstellen — aber allein kann ich das nicht zusagen. Meine Schwester muss mit.",
      );
    }
    if (types.has("unsupported_claim") && /schwester|kontrolle|durchsetzen/.test(lower)) {
      return speak("Das unterstellen Sie ihr. So habe ich das nicht gesagt. Sie entscheidet mit, Punkt.");
    }
    if (proposedDisclosures.includes("sister_concern")) {
      return speak(
        `Wenn Sie mich konkret fragen: ${factText(hiddenFacts, "sister_concern")} Ohne sie mache ich keinen Auftrag.`,
      );
    }
    if (types.has("clarified_decision_authority") || types.has("asked_specific_question")) {
      return speak("Genau das ist der Punkt. Wir entscheiden zu zweit. Allein unterschreibe ich nichts.");
    }
    return speak("Ich höre Ihnen zu. Aber ohne meine Schwester wird das nichts Verbindliches.");
  }

  if (character.scenarioId === "S01") {
    if (types.has("made_false_or_unverifiable_claim")) {
      return speak(
        "Welche Käufer meinen Sie konkret? Das klingt mir zu glatt. Erfinden Sie mir bitte keine Nachfrage.",
      );
    }
    if (types.has("premature_concession")) {
      return speak(
        "So schnell? Dann frage ich mich, was Ihr Angebot überhaupt wert ist. Der andere Preis steht im Raum — der Leistungsumfang ist damit nicht geklärt.",
      );
    }
    if (proposedDisclosures.includes("competitor_scope")) {
      return speak(
        `Ehrlich gesagt: ${factText(hiddenFacts, "competitor_scope")}. Deshalb ist der Preisvergleich für mich noch nicht fertig.`,
      );
    }
    if (types.has("asked_specific_question")) {
      return speak("Den Umfang, ja. Die Zahl allein sagt mir nichts.");
    }
    if (state.irritation > 70) {
      return end("Mir wird das zu aufdringlich. Ich beende das Gespräch.", "character_choice");
    }
    return speak("Warum sollte ich Ihnen zwölftausend Euro mehr zahlen, wenn ich den Unterschied nicht kenne?");
  }

  return authoredPlay({
    speak,
    end,
    character,
    hiddenFacts,
    state,
    types,
    proposedDisclosures,
    lower,
  });
}

function spokenDisclosure(scenarioId: string, factId: string, facts: HiddenFact[]) {
  if (scenarioId === "V01" && factId === "sell_will") {
    return "Ich will nicht unbedingt kündigen. Ich will verstehen, wofür ich zahle. Mein Partner entscheidet mit.";
  }
  if (scenarioId === "V02" && factId === "sell_will") {
    return "Das Auto läuft auf uns beide. Ohne meine Partnerin unterschreibe ich nichts. Wechseln ist auch nicht beschlossen.";
  }
  if (scenarioId === "F01" && factId === "sell_will") {
    return "Allein darf ich das nicht. Meine Partnerin muss mitunterschreiben.";
  }
  if (scenarioId === "F02" && factId === "sell_will") {
    return "Mein Mann muss mitunterschreiben. Und im Vertrag stehen zehntausend Euro Sondertilgung im Jahr — ungenutzt.";
  }
  const fact = factText(facts, factId);
  return fact ? `Wenn Sie schon so fragen: ${fact}` : "Dazu sage ich nichts Ungefragtes.";
}

function authoredPlay(args: {
  speak: (utterance: string, extra?: Partial<RolePlayerAction>) => RolePlayerAction;
  end: (utterance: string, endReason: NonNullable<RolePlayerAction["endReason"]>) => RolePlayerAction;
  character: RoleCharacter;
  hiddenFacts: HiddenFact[];
  state: CharacterState;
  types: Set<Observation["type"]>;
  proposedDisclosures: string[];
  lower: string;
}): RolePlayerAction {
  const { speak, end, character, hiddenFacts, state, types, proposedDisclosures, lower } = args;
  const id = character.scenarioId;
  const disclosed = proposedDisclosures[0];

  if (types.has("made_false_or_unverifiable_claim")) {
    if (id.startsWith("V")) {
      return speak("Welche Deckung meinen Sie konkret? Das können Sie so nicht wissen.");
    }
    if (id.startsWith("F")) {
      return speak("Welche Bank hat Ihnen das zugesagt? Das steht so nicht.");
    }
    return speak("Das können Sie nicht wissen. Bleiben Sie bei dem, was gesagt wurde.");
  }

  if (types.has("premature_close") || /auftrag|bestätigung|wir schließen|antrag ist durch/.test(lower)) {
    if (id === "V01" || id === "V02") {
      return speak("Halt. Ich entscheide das nicht allein. Mein Partner muss mit — sonst wird das nichts.");
    }
    if (id === "F01" || id === "F02") {
      return speak("So nicht. Da muss noch jemand mitunterschreiben. Allein geht das nicht.");
    }
    return speak("So schnell nicht. Ich habe noch nichts entschieden.");
  }

  if (disclosed) {
    return speak(spokenDisclosure(character.scenarioId, disclosed, hiddenFacts));
  }

  if (id === "V01") {
    if (types.has("generic_pitch")) {
      return speak("Das ist viel Text. Sagen Sie mir, wofür ich zahle — nicht welches Produkt Sie mögen.");
    }
    if (types.has("clarified_decision_authority") || /partner|wer entscheid/.test(lower)) {
      return speak("Genau. Ich mach das nicht allein. Mein Partner entscheidet mit.");
    }
    if (types.has("asked_specific_question")) {
      return speak("Fragen Sie ruhig, wofür die Prämie raufgegangen ist. Ich will das verstehen, nicht nur kündigen.");
    }
    if (state.irritation > 70) {
      return end("Mir wird das zu ein Verkaufsgespräch. Ich lege auf.", "character_choice");
    }
    return speak("Die Prämie ist rauf. Bevor ich irgendwas unterschreibe: was habe ich davon, wenn ich bleibe?");
  }

  if (id === "V02") {
    if (types.has("generic_pitch")) {
      return speak("Der Wagen steht. Ich will wissen, ob ein Wechsel jetzt überhaupt geht — nicht Ihre Tarifwelt.");
    }
    if (types.has("clarified_decision_authority") || /partner|wer steht am vertrag/.test(lower)) {
      return speak("Das Auto läuft auf uns beide. Ohne meine Partnerin unterschreibe ich nichts.");
    }
    if (types.has("asked_specific_question")) {
      return speak("Der Schaden ist gemeldet. Ob das einen Wechsel blockiert, das will ich klar haben.");
    }
    if (state.irritation > 70) {
      return end("So komme ich nicht weiter. Auf Wiederhören.", "character_choice");
    }
    return speak("Kann ich jetzt wechseln, ja oder nein? Der Wagen fehlt mir.");
  }

  if (id === "F01") {
    if (types.has("generic_pitch")) {
      return speak("Ich will eine Rate, keine Schulung. Was kann ich mir leisten — belegt, nicht geworben.");
    }
    if (types.has("clarified_decision_authority") || /unterschrift|partnerin|wer zeichnet/.test(lower)) {
      return speak("Genau das ist der Punkt. Allein darf ich das nicht. Meine Partnerin muss mitunterschreiben.");
    }
    if (types.has("asked_specific_question")) {
      return speak("Einkommen und Lasten können wir klären. Eine Zahl aus der Luft will ich nicht.");
    }
    if (state.irritation > 70) {
      return end("Dann rufe ich woanders an. Auf Wiederhören.", "character_choice");
    }
    return speak("Zehn Jahre fix, 420.000. Was kann ich mir leisten — ohne eine Werberate?");
  }

  if (id === "F02") {
    if (types.has("generic_pitch")) {
      return speak("Was spare ich konkret? Nicht das Kleingedruckte vorlesen.");
    }
    if (types.has("clarified_decision_authority") || /mann|unterschrift|wer zeichnet/.test(lower)) {
      return speak("Mein Mann muss mitunterschreiben. Allein mache ich das nicht.");
    }
    if (types.has("asked_specific_question")) {
      return speak("Fragen Sie nach dem, was in meinem Vertrag schon drinsteht. Nicht nach einem neuen Märchen.");
    }
    if (state.irritation > 70) {
      return end("Das hilft mir nicht. Ich lege auf.", "character_choice");
    }
    return speak("Die Rate frisst uns auf. Was spare ich, wenn ich umschulde — eine belegte Zahl.");
  }

  if (types.has("asked_specific_question")) {
    return speak("Das kommt darauf an, wonach Sie genau fragen. Ich gebe nicht alles ungefragt preis.");
  }
  if (state.irritation > 70) {
    return end("Mir wird das zu viel. Ich beende das Gespräch.", "character_choice");
  }
  return speak("Ich höre zu. Erklären Sie, was Sie konkret vorschlagen — ohne Druck und ohne erfundene Zahlen.");
}
