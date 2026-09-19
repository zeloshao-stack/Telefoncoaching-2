import assert from "node:assert/strict";
import { test } from "node:test";
import { characterForScenario } from "../../src/role-engine/characters";
import { hydrateAffect } from "../../src/role-engine/affect";
import { withHangup } from "../../src/role-engine/hangup";
import { pickRealtimeVoice, REALTIME_VOICES } from "../../src/role-engine/voice";
import type { CharacterState, RoleCharacter, TranscriptTurn } from "../../src/role-engine/types";
import { rubric } from "../content/pack";
import { advanceLiveState } from "../live-turn";
import {
  END_CALL_REASONS,
  isHangupReason,
  REALTIME_DEFAULT_MODEL,
  realtimeInstructions,
  realtimeModel,
  realtimeSessionConfig,
  realtimeTurnDetection,
  realtimeVoiceFor,
} from "../openai-realtime";
import { PLAYER_WORLD_LOCK } from "../../src/role-engine/playerWorldGate";
import {
  createLiveDedupe,
  isDuplicateUtterance,
  isMostlyNonLatin,
  isTooShortSpeech,
  liveGreetingInstructions,
  liveGreetingLine,
  netSpeechMs,
  LIVE_VAD_PREFIX_MS,
  LIVE_VAD_SILENCE_MS,
  liveInterruptClientEvents,
  shouldMuteOnUserSpeech,
  shouldShowThinking,
  shouldSuppressStartedAudio,
  shouldDeferSuppressedStart,
  shouldHoldClientPlayback,
  shouldReleasePlaybackSuppress,
  createLivePlaybackGate,
  livePlaybackAfterLocalCut,
  livePlaybackAfterResponseCreated,
  livePlaybackAfterSpeechStopped,
  livePlaybackAfterCutAck,
  applyHardPlaybackCut,
  applySoftPlaybackHold,
  restoreHardPlaybackCut,
  restoreSoftPlaybackHold,
  LIVE_STAGE_B_MIN_MS,
  LIVE_BACKCHANNEL_WORDS,
  createLivePlaybackClock,
  startLivePlaybackClock,
  freezeLivePlaybackClock,
  readLivePlaybackCursor,
  thawLivePlaybackClock,
  isLiveBackchannelTranscript,
  shouldPromoteLiveStageAToB,
  nextLiveBargeAction,
  hasLiveContentWord,
  hangupCloseOnEndCallTool,
  shouldFireHangupOnOutputStopped,
  remountLiveCallTransport,
  liveCallTransportIsFresh,
  liveStageAOnSpeechStarted,
  liveStageARestoreIsSafe,
  shouldKeepHeldGeneration,
  planLiveStageBCut,
  makeLiveHeardAck,
  heardMsFromCursor,
  isLiveEventCurrent,
  shouldPostLiveTranscript,
  isBenignLiveCancelError,
  isCancelledResponse,
  isStaleResponseTerminal,
  isPhantomLiveTranscript,
  summarizeLatencyMs,
  bargeInTimingMs,
} from "../live-text";
import { canRegisterLiveCall, isLiveCallClaimId, nextLiveClaimId } from "../live-session";

function withEnv<T>(vars: Record<string, string | undefined>, run: () => T): T {
  const before: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(vars)) {
    before[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return run();
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function stateOf(character: RoleCharacter): CharacterState {
  return { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
}

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("Live-Prompt trägt Persona-Kern und verdeckte Fakten, nie die Rubrik — Greeting nicht mehr im Prompt", () => {
  const character = characterForScenario("S01");
  const state = stateOf(character);
  const prior = [
    { speaker: "counterpart", text: character.opening },
    { speaker: "trainee", text: "Guten Tag, Frau Leitner, ich rufe wegen Ihrer Anfrage an." },
  ];
  const text = realtimeInstructions(character, character.hiddenFacts, state, prior);
  // Persona-Kern aus dem Charakter-Strang
  assert.match(text, /Elisabeth Leitner/);
  assert.doesNotMatch(text, /DU BIST Elisabeth Leitner, \d+/);
  assert.match(text, /kein Assistent/);
  assert.match(text, /hörbarer Abschied, dann end_call/);
  assert.match(text, /STIMME: /);
  assert.doesNotMatch(text, /INNERES:|REGELN:|VERDECKTES|Erst wenn|Diagnosefrage/);
  assert.match(text, /Stimme: /);
  assert.match(text, /end_call/);
  assert.match(text, /wait_for_user/);
  // Regeln aus der Live-Leitung bleiben — genau einmal
  assert.match(text, /UNKLARES AUDIO/);
  assert.equal(text.match(/UNKLARES AUDIO/g)?.length, 1);
  assert.equal(text.match(/wait_for_user/g)?.length, 1);
  assert.match(text, /Wechsle nie die Sprache/);
  assert.match(text, /keine Zeile wiederholen/);
  // Greeting läuft über response.create, nicht über die Instructions (im Verlauf darf der Satz stehen)
  assert.doesNotMatch(text, /als Erstes/);
  assert.doesNotMatch(text, /Eröffnung/);
  const fresh = realtimeInstructions(character, character.hiddenFacts, state);
  assert.doesNotMatch(fresh, new RegExp(escape(character.opening)));
  assert.doesNotMatch(fresh, /BISHER/);
  assert.match(text, /BISHER/);
  assert.doesNotMatch(text, /Rubrik|Gesamtnote|Scorebereich|B1|B2|B3|B4/);
  assert.doesNotMatch(text, new RegExp(escape(rubric.rule)));
  assert.doesNotMatch(text, /43\/57|Talk.?Ratio|flüstern|Coach sagt/i);
  assert.doesNotMatch(text, new RegExp(escape(character.acceptableOutcome.slice(0, 30))));
  assert.doesNotMatch(text, /INNERE LAGE|Erregung \d\/100|Prozess: contagion/);
  assert.doesNotMatch(text, /Diagnosefrage|Trainerziel|Fokus/);
  for (const fact of character.hiddenFacts) {
    if (fact.status !== "disclosed" && fact.fact.trim().length >= 12) {
      assert.doesNotMatch(text, new RegExp(escape(fact.fact.slice(0, 24))));
    }
  }
  for (const rule of character.hardConstraints) {
    assert.doesNotMatch(text, new RegExp(escape(rule.slice(0, 20))));
  }
  const opened = realtimeInstructions(
    character,
    character.hiddenFacts.map((f) => ({ ...f, status: "disclosed" as const })),
    { ...state, disclosedFacts: character.hiddenFacts.map((f) => f.id) },
  );
  assert.match(opened, /Nur Vermittlung/);
  assert.doesNotMatch(opened, /Erst wenn|Schon gesagt|jetzt darfst|Du weißt:/);
});

test("Live-Prompt bleibt unter 3000 Zeichen — Seed-Figuren und Generator-Szenarien; Verlauf beim Wiederaufbau gekürzt", () => {
  const longLine =
    "Es geht um Ihr Haus in der Josefstädter Straße, ich hätte da eine Frage zur Verwaltung, zur Fassade und zum Stiegenhaus, das wurde ja länger nicht saniert.";
  for (const id of ["S01", "S02", "S03", "A01", "V01", "F01"]) {
    const character = characterForScenario(id);
    const fresh = realtimeInstructions(character, character.hiddenFacts, stateOf(character));
    assert.ok(fresh.length < 3000, `${id}: ${fresh.length} Zeichen`);
    // Patch für die laufende Leitung: ohne BISHER-Block, bleibt ebenfalls unter 3000
    const prior = [
      { speaker: "counterpart", text: character.opening },
      { speaker: "trainee", text: "Grüß Gott, hier Huber von der Hausverwaltung, haben Sie kurz Zeit?" },
      { speaker: "counterpart", text: "Worum geht's?" },
      { speaker: "trainee", text: longLine },
    ];
    const patch = realtimeInstructions(character, character.hiddenFacts, stateOf(character), prior, { historyTurns: 0 });
    assert.doesNotMatch(patch, /BISHER/);
    assert.ok(patch.length < 3000, `${id} Patch: ${patch.length} Zeichen`);
    // Wiederaufbau der Leitung: Verlauf dabei, Zeilen auf ~110 Zeichen gekürzt
    const rebuilt = realtimeInstructions(character, character.hiddenFacts, stateOf(character), prior);
    assert.match(rebuilt, /BISHER/);
    assert.doesNotMatch(rebuilt, new RegExp(escape(longLine)));
    assert.match(rebuilt, /Josefstädter Straße/);
    assert.ok(rebuilt.length < 3500, `${id} mit Verlauf: ${rebuilt.length} Zeichen`);
  }
});

test("Voice-Mapping der Live-Leitung: gültige Realtime-Stimme je Figur, deckungsgleich mit pickRealtimeVoice", () => {
  for (const id of ["S01", "S02", "S03"]) {
    const character = characterForScenario(id);
    const voice = realtimeVoiceFor(character);
    assert.ok(REALTIME_VOICES.includes(voice), `${id}: ${voice}`);
    assert.equal(voice, pickRealtimeVoice(character));
    const config = realtimeSessionConfig(character, character.hiddenFacts, stateOf(character));
    assert.equal(config.audio.output.voice, voice);
  }
  assert.equal(realtimeVoiceFor(characterForScenario("S02")), "cedar");
});

test("end_call kennt alle Auflege-Gründe; withHangup schreibt Grund und Trigger in den Zustand", () => {
  const character = characterForScenario("S01");
  const config = realtimeSessionConfig(character, character.hiddenFacts, stateOf(character));
  const endCall = config.tools.find((tool) => tool.name === "end_call");
  assert.ok(endCall && "parameters" in endCall && endCall.parameters);
  const params = endCall.parameters as { properties: { reason: { enum: string[] } } };
  assert.deepEqual(
    [...params.properties.reason.enum].sort(),
    ["abuse", "boundary_ignored", "character_choice", "final_no", "no_reason_to_continue", "time_exhausted"],
  );
  assert.deepEqual([...END_CALL_REASONS].sort(), [...params.properties.reason.enum].sort());
  assert.equal(isHangupReason("abuse"), true);
  assert.equal(isHangupReason("aufgelegt"), false);

  const ended = withHangup(stateOf(character), "no_reason_to_continue", "2× abgewimmelt");
  assert.equal(ended.status, "ended");
  assert.equal(ended.hangupReason, "no_reason_to_continue");
  assert.equal(ended.hangupTrigger, "2× abgewimmelt");
});

test("Live-Turns: heuristische Auflegeneigung erzwingt keine neue Anweisung", () => {
  const character = characterForScenario("A01");
  // Vor dem ersten Wort des Anrufers legt niemand auf — auch Franz (S02) nicht.
  for (const id of ["A01", "S02"]) {
    const c = characterForScenario(id);
    assert.doesNotMatch(realtimeInstructions(c, c.hiddenFacts, stateOf(c)), /LEG JETZT AUF/);
  }

  let state = stateOf(character);
  const prior: TranscriptTurn[] = [{ id: "c0", speaker: "counterpart", text: character.opening }];
  const bad = [
    "Wir sind ein großes Maklerhaus mit tollen Referenzen und vielen zufriedenen Kunden.",
    "Wir haben ein tolles Angebot mit einer einzigartigen Vermarktungsstrategie für Sie.",
    "Unsere Kunden sind begeistert, wir sind Marktführer in der Region.",
  ];
  const brushOffs = [
    "Ich hab grad keine Zeit. Worum geht's?",
    "Kein Interesse. Sagen S' in einem Satz, warum Sie anrufen.",
    "Passt gerade nicht. Was wollen Sie?",
  ];
  let hangupInstructions: string | null = null;
  let hangupAt = -1;
  for (let i = 0; i < bad.length && !hangupInstructions; i += 1) {
    const traineeTurn: TranscriptTurn = { id: `t${i}`, speaker: "trainee", text: bad[i]! };
    const advance = advanceLiveState(character, state, prior, traineeTurn);
    state = advance.state;
    prior.push(traineeTurn);
    if (advance.policy.shouldHangUp) {
      assert.equal(advance.refresh, false);
      assert.equal(advance.refreshReason, null);
      hangupAt = i + 1;
      hangupInstructions = realtimeInstructions(character, character.hiddenFacts, state, prior, {
        observations: advance.observations,
        historyTurns: 0,
      });
    } else {
      prior.push({ id: `c${i + 1}`, speaker: "counterpart", text: brushOffs[i]! });
    }
  }
  assert.ok(hangupInstructions, "keine Auflege-Anweisung nach drei Verkaufssätzen ohne Grund");
  assert.ok(hangupAt <= 3 && hangupAt >= 2, `legt nach ${hangupAt} Zügen auf`);
  const text: string = hangupInstructions!;
  assert.doesNotMatch(text, /LEG JETZT AUF/);
  assert.match(text, /Du entscheidest aus dem konkreten Verlauf/);
  assert.doesNotMatch(text, /BISHER/);
  assert.ok(text.length < 3100, `${text.length} Zeichen`);
});

test("Live-Turns: Grüße und weiterer Gesprächsanlass erzwingen keine periodischen Updates", () => {
  const character = characterForScenario("S03");
  const state = stateOf(character);
  const prior: TranscriptTurn[] = [{ id: "c0", speaker: "counterpart", text: character.opening }];
  const first = advanceLiveState(character, state, prior, { id: "t0", speaker: "trainee", text: "Grüß Gott, Herr Huber." });
  assert.equal(first.refreshReason, null);
  const second = advanceLiveState(character, first.state, [...prior, { id: "t0", speaker: "trainee", text: "Grüß Gott, Herr Huber." }], {
    id: "t1",
    speaker: "trainee",
    text: "Ich rufe an, weil Sie eine Bewertung wollten. Passt es gerade?",
  });
  assert.equal(second.refresh, false);
  assert.equal(second.policy.shouldHangUp, false);
  assert.equal(second.policy.reasonGiven, true);
});

test("Live-Turns: Schlüsselwörter geben keine Fakten frei; bestehende Freigaben bleiben erhalten", () => {
  const c = characterForScenario("S01");
  const turn: TranscriptTurn = { id: "fact-query", speaker: "trainee", text: "Welche Leistungen umfasst das andere Angebot genau?" };
  const first = advanceLiveState(c, stateOf(c), [], turn);
  assert.ok(!first.state.disclosedFacts.includes("competitor_scope"));
  assert.equal(first.refreshReason, null);
  const second = advanceLiveState(c, { ...first.state, disclosedFacts: ["competitor_scope"] }, [turn], { ...turn, id: "fact-query-2" });
  assert.deepEqual(second.state.disclosedFacts, ["competitor_scope"]);
  assert.equal(second.refresh, false);
});

test("Greeting kommt als eigener Satz aus dem Protokoll, nur solange der Anrufer schweigt", () => {
  const opening = "Leitner. Worum geht's?";
  assert.equal(liveGreetingLine(opening, [{ speaker: "counterpart", text: opening }]), opening);
  assert.equal(
    liveGreetingLine(opening, [
      { speaker: "counterpart", text: opening },
      { speaker: "counterpart", text: "Ich hab wenig Zeit." },
    ]),
    "Ich hab wenig Zeit.",
  );
  assert.equal(
    liveGreetingLine(opening, [
      { speaker: "counterpart", text: opening },
      { speaker: "trainee", text: "Guten Tag." },
    ]),
    null,
  );
  assert.equal(liveGreetingLine(opening, []), opening);
  assert.match(liveGreetingInstructions(opening), /genau diesen einen Satz/);
  assert.match(liveGreetingInstructions(opening), new RegExp(opening.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("Realtime-Config: Audio, far_field, Transkript-Prompt, beide Werkzeuge, VAD entschärft", () => {
  const character = characterForScenario("S01");
  const state = { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
  const config = withEnv({ REALTIME_VAD: undefined, REALTIME_MODEL: undefined }, () =>
    realtimeSessionConfig(character, character.hiddenFacts, state),
  );
  assert.equal(config.type, "realtime");
  assert.equal(config.model, REALTIME_DEFAULT_MODEL);
  assert.deepEqual(config.output_modalities, ["audio"]);
  assert.equal(config.audio.input.noise_reduction.type, "far_field");
  assert.equal(config.audio.input.transcription.language, "de");
  assert.match(config.audio.input.transcription.prompt, /Deutsch/);
  const vad = config.audio.input.turn_detection;
  assert.equal(vad.type, "server_vad");
  if (vad.type === "server_vad") {
    assert.equal(vad.threshold, 0.65);
    assert.equal(vad.prefix_padding_ms, 300);
    assert.equal(vad.silence_duration_ms, 500);
    assert.equal(vad.idle_timeout_ms, 9000);
    assert.equal(vad.prefix_padding_ms, LIVE_VAD_PREFIX_MS);
    assert.equal(vad.silence_duration_ms, LIVE_VAD_SILENCE_MS);
  }
  assert.equal(vad.create_response, true);
  // Client ist Stufe-B-Owner: Default-server_vad darf bei speech_started nicht canceln.
  assert.equal(vad.interrupt_response, false);
  assert.deepEqual(
    config.tools.map((tool) => tool.name),
    ["recall_memory", "end_call", "wait_for_user"],
  );
  const wait = config.tools.find((tool) => tool.name === "wait_for_user");
  assert.ok(wait && "description" in wait);
  assert.match(String(wait.description), new RegExp(PLAYER_WORLD_LOCK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(config.instructions, /REGELN:|Erfinde keine Käufer|Diagnosefrage/);
  assert.doesNotMatch(config.instructions, /World-bound/);
  assert.ok(["sage", "ash", "coral", "ballad", "alloy", "echo", "shimmer", "verse", "marin", "cedar"].includes(realtimeVoiceFor(character)));
});

test("Env schaltet VAD auf semantic und das Modell um", () => {
  const semantic = withEnv({ REALTIME_VAD: "semantic" }, () => realtimeTurnDetection());
  assert.equal(semantic.type, "semantic_vad");
  if (semantic.type === "semantic_vad") assert.equal(semantic.eagerness, "high");
  assert.equal(semantic.create_response, true);
  assert.equal(semantic.interrupt_response, false);
  assert.equal(realtimeTurnDetection("anything-else").type, "server_vad");
  assert.equal(realtimeTurnDetection(undefined).type, "server_vad");
  assert.equal(withEnv({ REALTIME_MODEL: undefined }, realtimeModel), "gpt-realtime-2.1");
  assert.equal(withEnv({ REALTIME_MODEL: " gpt-realtime-2.1-mini " }, realtimeModel), "gpt-realtime-2.1-mini");
  assert.equal(REALTIME_DEFAULT_MODEL, "gpt-realtime-2.1");
});

test("Dedupe: genau einmal pro item_id, Wortgleiches nur im kurzen Fenster", () => {
  const dedupe = createLiveDedupe(3000);
  assert.equal(dedupe.take("item_1", "Was genau umfasst das?", 0), true);
  assert.equal(dedupe.take("item_1", "Was genau umfasst das?", 100), false);
  assert.equal(dedupe.take("item_1", "Etwas ganz anderes", 200), false);
  // andere item_id, gleicher Wortlaut, sofort danach → Netz greift
  assert.equal(dedupe.take("item_2", "was genau umfasst das", 500), false);
  // gleicher Wortlaut nach dem Fenster → legitime Wiederholung
  assert.equal(dedupe.take("item_3", "Was genau umfasst das?", 4000), true);
  // „Ja.“ zweimal hintereinander mit Abstand bleibt erlaubt, ASR-Varianten werden nicht mehr fuzzy geschluckt
  assert.equal(dedupe.take("item_4", "Ja.", 5000), true);
  assert.equal(dedupe.take("item_5", "Ja.", 9000), true);
  assert.equal(dedupe.take("item_6", "Ja hallo, hat das jetzt Sinn?", 10000), true);
  assert.equal(dedupe.take("item_7", "Ja, hallo, hat das jetzt hin?", 10500), true);
  assert.equal(dedupe.take(undefined, "   ", 11000), false);
  assert.equal(dedupe.take(undefined, "Ohne Id", 12000), true);
  assert.equal(dedupe.take(undefined, "Ohne Id", 12500), false);
  assert.equal(dedupe.seenItem("item_1"), true);
  assert.equal(dedupe.seenItem("nope"), false);
});

test("Server-Netz: nur wortgleich innerhalb von 3 s ist ein Doppel", () => {
  const now = Date.parse("2026-09-18T10:00:10.000Z");
  const fresh = new Date(now - 1000).toISOString();
  const old = new Date(now - 30_000).toISOString();
  const prior = [
    { speaker: "counterpart", text: "Ein anderer Makler macht das um 36.000 Euro.", created_at: old },
    { speaker: "trainee", text: "Was genau umfasst das?", created_at: fresh },
  ];
  assert.equal(isDuplicateUtterance(prior, "trainee", "Was genau umfasst das?", now), true);
  assert.equal(isDuplicateUtterance(prior, "trainee", "  was genau umfasst das  ", now), true);
  assert.equal(isDuplicateUtterance(prior, "trainee", "Und der Preis?", now), false);
  assert.equal(isDuplicateUtterance(prior, "counterpart", "Ein anderer Makler macht das um 36.000 Euro.", now), false);
  assert.equal(isDuplicateUtterance(prior, "trainee", "Was genau umfasst das?", now + 5000), false);
  assert.equal(
    isDuplicateUtterance([{ speaker: "trainee", text: "Ja hallo, hat das jetzt Sinn?", created_at: fresh }], "trainee", "Ja, hallo, hat das jetzt hin?", now),
    false,
  );
  assert.equal(isDuplicateUtterance(prior, "trainee", "   ", now), true);
});

test("Schriftfilter: Kyrillisch & Co. raus, Deutsch mit Umlauten und Zahlen bleibt", () => {
  assert.equal(isMostlyNonLatin("Привет, как дела?"), true);
  assert.equal(isMostlyNonLatin("Γεια σου"), true);
  assert.equal(isMostlyNonLatin("こんにちは"), true);
  assert.equal(isMostlyNonLatin("Grüß Gott, Frau Leitner!"), false);
  assert.equal(isMostlyNonLatin("36.000 Euro, ja."), false);
  assert.equal(isMostlyNonLatin("Café Ölmühle — Straße"), false);
  assert.equal(isMostlyNonLatin("…?!"), false);
  assert.equal(isMostlyNonLatin("Okay danke, спасибо"), false); // mehrheitlich lateinisch → bleibt
  assert.equal(isMostlyNonLatin("Ja спасибо большое"), true);
});

test("Phantom-STT: englische Halluzinationen und kurze Fragmente verwerfen, echte Kurzantworten bleiben", () => {
  assert.equal(isPhantomLiveTranscript("What's Stinkschad?"), true);
  assert.equal(isPhantomLiveTranscript("What is that?"), true);
  assert.equal(isPhantomLiveTranscript("Bereit?"), true);
  assert.equal(isPhantomLiveTranscript("Thanks for watching!"), true);
  assert.equal(isPhantomLiveTranscript("Привет"), true);
  assert.equal(isPhantomLiveTranscript("a"), true);
  assert.equal(isPhantomLiveTranscript("Ja"), false);
  assert.equal(isPhantomLiveTranscript("Nein."), false);
  assert.equal(isPhantomLiveTranscript("Grüß Gott, Frau Leitner, haben Sie kurz Zeit?"), false);
  assert.equal(isPhantomLiveTranscript("36.000 Euro, ja."), false);
});

test("Latenzreihe und Barge-in-Timing: min/median/max und clearMs", () => {
  assert.equal(summarizeLatencyMs([]), null);
  assert.deepEqual(summarizeLatencyMs([1200, 800, 950]), { n: 3, min: 800, median: 950, max: 1200 });
  assert.deepEqual(summarizeLatencyMs([100, 200, 300, 400]), { n: 4, min: 100, median: 250, max: 400 });
  assert.equal(bargeInTimingMs(1000, 1080), 80);
  assert.equal(bargeInTimingMs(1000, 999), 0);
});

test("409-Race: Claim-Lock und Claim→rtc Upgrade-Regel", () => {
  assert.equal(isLiveCallClaimId("claim_abc"), true);
  assert.equal(isLiveCallClaimId("rtc_xyz"), false);
  assert.equal(nextLiveClaimId("claim_keep"), "claim_keep");
  assert.equal(nextLiveClaimId("rtc_1"), "rtc_1");
  assert.match(nextLiveClaimId(null), /^claim_/);
  assert.equal(canRegisterLiveCall(null, "claim_a"), true);
  assert.equal(canRegisterLiveCall("claim_a", "claim_a"), true);
  assert.equal(canRegisterLiveCall("claim_a", "rtc_1", "claim_a"), true);
  assert.equal(canRegisterLiveCall("claim_a", "rtc_1"), false);
  assert.equal(canRegisterLiveCall("rtc_other", "rtc_1", "claim_a"), false);
});

test("Mindestdauer: Vor- und Nachlauf werden herausgerechnet", () => {
  const pad = LIVE_VAD_PREFIX_MS + LIVE_VAD_SILENCE_MS;
  assert.equal(netSpeechMs(1000, 1000 + pad + 200), 200);
  assert.equal(isTooShortSpeech(1000, 1000 + pad + 200), true);
  assert.equal(isTooShortSpeech(1000, 1000 + pad + 349), true);
  assert.equal(isTooShortSpeech(1000, 1000 + pad + 350), false);
  assert.equal(isTooShortSpeech(0, 3000), false);
});

test("Barge-in: lokales Mute nur wenn die Figur hörbar ist; thinking nur ohne Audio", () => {
  assert.equal(shouldMuteOnUserSpeech("speaking", true), true);
  assert.equal(shouldMuteOnUserSpeech("speaking", false), true);
  assert.equal(shouldMuteOnUserSpeech("listening", true), true);
  assert.equal(shouldMuteOnUserSpeech("listening", false), false);
  assert.equal(shouldMuteOnUserSpeech("thinking", false), false);
  assert.equal(shouldMuteOnUserSpeech("idle", false), false);
  assert.equal(shouldMuteOnUserSpeech("interrupted", false), false);
  assert.equal(shouldShowThinking(true), false);
  assert.equal(shouldShowThinking(false), true);
});

test("Barge-in: Client-Events kappen Audio, Truncate bleibt draußen; Altpuffer bleibt tot", () => {
  const events = liveInterruptClientEvents("resp_old");
  assert.deepEqual(
    events.map((event) => event.type),
    ["response.cancel", "output_audio_buffer.clear"],
  );
  assert.equal(events[0]?.response_id, "resp_old");
  assert.equal("response_id" in (liveInterruptClientEvents()[0] ?? {}), false);
  assert.equal(
    events.some((event) => event.type === "conversation.item.truncate"),
    false,
  );
  assert.equal(shouldSuppressStartedAudio(true, "resp_new", "resp_old"), true);
  assert.equal(shouldSuppressStartedAudio(false, "resp_old", "resp_old"), true);
  assert.equal(shouldSuppressStartedAudio(false, "resp_new", "resp_old"), false);
  assert.equal(shouldSuppressStartedAudio(false, undefined, "resp_old"), false);
  assert.equal(shouldSuppressStartedAudio(false, "resp_new", "resp_old", "resp_new"), false);
  assert.equal(shouldSuppressStartedAudio(false, "resp_new", "resp_old", "resp_other"), true);
  assert.equal(shouldSuppressStartedAudio(false, undefined, "resp_old", "resp_new"), true);
  assert.equal(isStaleResponseTerminal("resp_old", "resp_new"), true);
  assert.equal(isStaleResponseTerminal("resp_new", "resp_new"), false);
  assert.equal(isStaleResponseTerminal(undefined, "resp_new"), false);
  assert.equal(isCancelledResponse("response.done", "cancelled"), true);
  assert.equal(isCancelledResponse("response.cancelled", undefined), true);
  assert.equal(isCancelledResponse("response.done", "completed"), false);
});

test("Barge-in-Sperre bleibt über response.created bis speech_stopped und Cancel der Cut-ID", () => {
  let gate = livePlaybackAfterLocalCut(createLivePlaybackGate(), "resp_old");
  gate = livePlaybackAfterResponseCreated(gate);
  assert.equal(gate.suppressPlayback, true);
  assert.equal(gate.cutResponseId, "resp_old");
  assert.equal(shouldReleasePlaybackSuppress(gate), false);
  assert.equal(shouldSuppressStartedAudio(gate.suppressPlayback, "resp_new", gate.cutResponseId, "resp_new"), true);
  assert.equal(shouldDeferSuppressedStart(true, "resp_new", "resp_new", "resp_old"), true);
  assert.equal(shouldDeferSuppressedStart(true, "resp_old", "resp_new", "resp_old"), false);
  gate = livePlaybackAfterSpeechStopped(gate);
  assert.equal(gate.suppressPlayback, true);
  assert.equal(shouldReleasePlaybackSuppress(gate), false);
  gate = livePlaybackAfterCutAck(gate, "resp_new");
  assert.equal(gate.suppressPlayback, true);
  gate = livePlaybackAfterCutAck(gate, "resp_old");
  assert.equal(gate.suppressPlayback, false);
  assert.equal(gate.cutResponseId, "resp_old");
  assert.equal(shouldSuppressStartedAudio(false, "resp_new", "resp_old", "resp_new"), false);
  assert.equal(shouldSuppressStartedAudio(false, "resp_old", "resp_old", "resp_new"), true);
  assert.equal(shouldHoldClientPlayback(true, false), true);
  assert.equal(shouldHoldClientPlayback(false, true), true);
  assert.equal(shouldHoldClientPlayback(false, false), false);
});

test("Hard-Cut: Mute und Gain vor pause, currentTime unangetastet", () => {
  const order: string[] = [];
  const tracks = [{ enabled: true }];
  const audio = {
    muted: false,
    volume: 1,
    currentTime: 12.5,
    srcObject: { getAudioTracks: () => tracks },
    pause() {
      order.push(`pause muted=${this.muted} volume=${this.volume} track=${tracks[0].enabled}`);
    },
  };
  applyHardPlaybackCut(audio);
  assert.equal(audio.muted, true);
  assert.equal(audio.volume, 0);
  assert.equal(tracks[0].enabled, false);
  assert.equal(audio.currentTime, 12.5);
  assert.deepEqual(order, ["pause muted=true volume=0 track=false"]);
  restoreHardPlaybackCut(audio, false);
  assert.equal(tracks[0].enabled, true);
  assert.equal(audio.volume, 1);
  assert.equal(audio.muted, false);
  assert.equal(audio.currentTime, 12.5);
});

test("Call-Generation: verspätete Events und Nutzer-Transkripte nach Ende nicht posten", () => {
  assert.equal(isLiveEventCurrent(1, 1), true);
  assert.equal(isLiveEventCurrent(1, 2), false);
  assert.equal(isLiveEventCurrent(0, 0), false);
  assert.equal(
    shouldPostLiveTranscript({
      eventGeneration: 3,
      activeGeneration: 3,
      ended: false,
      speaker: "trainee",
    }),
    true,
  );
  assert.equal(
    shouldPostLiveTranscript({
      eventGeneration: 3,
      activeGeneration: 4,
      ended: false,
      speaker: "counterpart",
    }),
    false,
  );
  assert.equal(
    shouldPostLiveTranscript({
      eventGeneration: 3,
      activeGeneration: 3,
      ended: true,
      speaker: "trainee",
    }),
    false,
  );
  assert.equal(
    shouldPostLiveTranscript({
      eventGeneration: 3,
      activeGeneration: 3,
      ended: true,
      speaker: "counterpart",
    }),
    true,
  );
});

test("Barge-in: Cancellation failed ohne aktive Antwort ist harmlos, kein UI-Fehler", () => {
  assert.equal(
    isBenignLiveCancelError(undefined, "Cancellation failed: no active response found"),
    true,
  );
  assert.equal(isBenignLiveCancelError("response_cancel_not_active", "cannot cancel"), true);
  assert.equal(isBenignLiveCancelError("server_error", "model overloaded"), false);
});

test("Client ist Stufe-B-Owner: Default server_vad interrupt_response aus; create_response bleibt", () => {
  const vad = withEnv({ REALTIME_VAD: undefined }, () => realtimeTurnDetection());
  assert.equal(vad.type, "server_vad");
  assert.equal(vad.interrupt_response, false);
  assert.equal(vad.create_response, true);
  const semantic = withEnv({ REALTIME_VAD: "semantic" }, () => realtimeTurnDetection());
  assert.equal(semantic.interrupt_response, false);
  assert.equal(semantic.create_response, true);
});

test("Stufe A hält ohne Interrupt-Events; Phase bleibt speaking", () => {
  assert.equal(LIVE_STAGE_B_MIN_MS, 800);
  assert.equal(liveStageAOnSpeechStarted("speaking", true, "none"), true);
  assert.equal(liveStageAOnSpeechStarted("speaking", true, "A"), false);
  assert.equal(liveStageAOnSpeechStarted("speaking", true, "B"), false);
  assert.equal(liveStageAOnSpeechStarted("listening", false, "none"), false);
  assert.equal(shouldKeepHeldGeneration("A"), true);
  assert.equal(shouldKeepHeldGeneration("B"), false);
  assert.equal(shouldKeepHeldGeneration("none"), false);
  const hold = nextLiveBargeAction({
    stage: "A",
    elapsedMs: 200,
    interimTranscript: "mhm",
    speechStopped: false,
  });
  assert.equal(hold, "stay_A");
  const audio = { muted: false, volume: 1 };
  applySoftPlaybackHold(audio);
  assert.equal(audio.muted, true);
  assert.equal(audio.volume, 0);
  restoreSoftPlaybackHold(audio, false);
  assert.equal(audio.muted, false);
  assert.equal(audio.volume, 1);
});

test("Stufe A: mhm/Backchannel resumed, nur Inhalt → B mit cancel+clear", () => {
  for (const word of LIVE_BACKCHANNEL_WORDS) {
    assert.equal(isLiveBackchannelTranscript(word), true, word);
  }
  assert.equal(isLiveBackchannelTranscript("Mhm."), true);
  assert.equal(isLiveBackchannelTranscript("ja genau"), true);
  assert.equal(isLiveBackchannelTranscript("mhm Frau Leitner"), false);
  assert.equal(isLiveBackchannelTranscript(""), false);
  assert.equal(hasLiveContentWord("mhm"), false);
  assert.equal(hasLiveContentWord(""), false);
  assert.equal(hasLiveContentWord("nein warten Sie"), true);
  assert.equal(shouldPromoteLiveStageAToB(200, "mhm"), false);
  assert.equal(shouldPromoteLiveStageAToB(200, "m"), false);
  assert.equal(shouldPromoteLiveStageAToB(200, "das Haus in der Josefstadt"), true);
  assert.equal(shouldPromoteLiveStageAToB(800, "mhm"), false);
  assert.equal(shouldPromoteLiveStageAToB(799, ""), false);
  assert.equal(shouldPromoteLiveStageAToB(LIVE_STAGE_B_MIN_MS, ""), false);
  assert.equal(
    nextLiveBargeAction({ stage: "A", elapsedMs: 250, interimTranscript: "mhm", speechStopped: true }),
    "resume_A",
  );
  assert.equal(
    nextLiveBargeAction({ stage: "A", elapsedMs: 250, interimTranscript: "", speechStopped: true }),
    "stay_A",
  );
  assert.equal(
    nextLiveBargeAction({ stage: "A", elapsedMs: 250, interimTranscript: "nein, warten Sie", speechStopped: false }),
    "promote_B",
  );
  assert.equal(
    nextLiveBargeAction({ stage: "A", elapsedMs: LIVE_STAGE_B_MIN_MS, interimTranscript: "", speechStopped: false }),
    "release_A",
  );
  assert.equal(
    nextLiveBargeAction({ stage: "A", elapsedMs: LIVE_STAGE_B_MIN_MS, interimTranscript: "mhm", speechStopped: false }),
    "release_A",
  );
  assert.equal(
    nextLiveBargeAction({
      stage: "A",
      elapsedMs: LIVE_STAGE_B_MIN_MS,
      interimTranscript: "nein, warten Sie",
      speechStopped: false,
    }),
    "promote_B",
  );
  const clock = startLivePlaybackClock(createLivePlaybackClock(), "resp_old", 1000);
  const plan = planLiveStageBCut(clock, 1450, "resp_old");
  assert.equal(plan.stage, "B");
  assert.deepEqual([...plan.order], ["freeze", "cut", "cancel_clear", "heard_ack"]);
  assert.deepEqual(
    plan.interruptEvents.map((event) => event.type),
    ["response.cancel", "output_audio_buffer.clear"],
  );
  assert.equal(
    plan.interruptEvents.some((event) => event.type === "conversation.item.truncate"),
    false,
  );
  assert.equal(plan.cursor, 450);
  assert.equal(plan.heardAck.heard_ms, 450);
  assert.equal(plan.heardAck.generation_id, "resp_old");
  assert.equal(plan.clock.audibleSince, null);
  assert.equal(readLivePlaybackCursor(plan.clock, 9999), 450);
});

test("Playback-Uhr: freeze vor cancel, Fail=unknown kein Fake-0, audio_end_ms ist nicht heard", () => {
  assert.equal(readLivePlaybackCursor(createLivePlaybackClock(), 50), "unknown");
  assert.equal(heardMsFromCursor("unknown"), "unknown");
  assert.equal(heardMsFromCursor(0), "unknown");
  const started = startLivePlaybackClock(createLivePlaybackClock(), "resp_1", 2000);
  const held = freezeLivePlaybackClock(started, 2300);
  assert.equal(held.cursor, 300);
  const lateRead = readLivePlaybackCursor(held.clock, 5000);
  assert.equal(lateRead, 300);
  const userAudioEndMs = 12_400;
  const ack = makeLiveHeardAck("resp_1", held.cursor);
  assert.notEqual(ack.heard_ms, userAudioEndMs);
  assert.equal(ack.playback_cursor_ms, 300);
  const resumed = thawLivePlaybackClock(held.clock, 2400);
  assert.equal(resumed.generation_id, "resp_1");
  assert.equal(readLivePlaybackCursor(resumed, 2500), 400);
  assert.equal(liveStageARestoreIsSafe({ suppressPlayback: false, holdPlayback: false, hasRemote: true }), true);
  assert.equal(liveStageARestoreIsSafe({ suppressPlayback: true, holdPlayback: false, hasRemote: true }), false);
  assert.equal(liveStageARestoreIsSafe({ suppressPlayback: false, holdPlayback: true, hasRemote: true }), false);
  assert.equal(liveStageARestoreIsSafe({ suppressPlayback: false, holdPlayback: false, hasRemote: false }), false);
});

test("S4: 800 ms ohne Inhalt ist release_A, kein cancel/clear", () => {
  const capEmpty = nextLiveBargeAction({
    stage: "A",
    elapsedMs: LIVE_STAGE_B_MIN_MS,
    interimTranscript: "",
    speechStopped: false,
  });
  const capMhm = nextLiveBargeAction({
    stage: "A",
    elapsedMs: LIVE_STAGE_B_MIN_MS,
    interimTranscript: "mhm",
    speechStopped: false,
  });
  assert.equal(capEmpty, "release_A");
  assert.equal(capMhm, "release_A");
  assert.notEqual(capEmpty, "promote_B");
  const plan = planLiveStageBCut(startLivePlaybackClock(createLivePlaybackClock(), "resp_noise", 1), 2, "resp_noise");
  assert.ok(plan.interruptEvents.some((event) => event.type === "response.cancel"));
  // release_A darf diese Events nicht auslösen — nur promote_B tut das.
  assert.equal(
    nextLiveBargeAction({
      stage: "A",
      elapsedMs: LIVE_STAGE_B_MIN_MS,
      interimTranscript: "",
      speechStopped: true,
    }),
    "release_A",
  );
});

test("S2: Hangup-Tx schließt nach Buffer-Stop auch in Stufe A, nicht vorher", () => {
  assert.equal(shouldFireHangupOnOutputStopped({ pendingEndCall: true }), true);
  assert.equal(shouldFireHangupOnOutputStopped({ pendingEndCall: false }), false);
  assert.equal(hangupCloseOnEndCallTool({ audioPlaying: true, bargeStage: "none" }), "wait");
  assert.equal(hangupCloseOnEndCallTool({ audioPlaying: false, bargeStage: "A" }), "wait");
  assert.equal(hangupCloseOnEndCallTool({ audioPlaying: true, bargeStage: "A" }), "wait");
  assert.equal(hangupCloseOnEndCallTool({ audioPlaying: false, bargeStage: "none" }), "now");
  assert.equal(hangupCloseOnEndCallTool({ audioPlaying: false, bargeStage: "B" }), "now");
  const vad = withEnv({ REALTIME_VAD: undefined }, () => realtimeTurnDetection());
  assert.equal(vad.interrupt_response, false);
  assert.equal(
    liveInterruptClientEvents("resp_bye").some((event) => event.type === "conversation.item.truncate"),
    false,
  );
});

test("S3: Repeat remountet Uhr und Gate, erbt keine Cut-Sperre", () => {
  const dirtyClock = startLivePlaybackClock(createLivePlaybackClock(), "resp_old", 1000);
  const dirtyGate = livePlaybackAfterLocalCut(createLivePlaybackGate(), "resp_old");
  assert.equal(dirtyGate.suppressPlayback, true);
  assert.equal(dirtyClock.generation_id, "resp_old");
  const next = remountLiveCallTransport();
  assert.equal(liveCallTransportIsFresh(next), true);
  assert.equal(next.gate.suppressPlayback, false);
  assert.equal(next.gate.cutResponseId, null);
  assert.equal(next.gate.heardAck, null);
  assert.equal(next.clock.generation_id, null);
  assert.equal(next.bargeStage, "none");
  assert.notEqual(next.gate.cutResponseId, dirtyGate.cutResponseId);
  assert.notEqual(next.clock.generation_id, dirtyClock.generation_id);
});
