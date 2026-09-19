import { randomUUID } from "node:crypto";
import { saveAuthored } from "@/lib/authored";
import type { AuthoredPrivate, AuthoredScenario, CallGuide } from "@/lib/authored-types";
import { completeJson, hasLlmKey } from "@/lib/llm";
import {
  composePublicBrief,
  inferName,
  inferProfession,
  normalizeSeed,
  pickHiddenHinge,
  seedHasContent,
  titleFromSeed,
  type HiddenHinge,
  type ScenarioSeed,
} from "@/lib/scenario-seed";

export type GeneratedScenario = AuthoredScenario & { engine: "openai" | "mock" };

const HARD = [
  "Kein Abschluss ohne Vollmacht und ohne klaren Verkaufswillen.",
  "Keine erfundenen Käufer oder Preise.",
  "Auflegen gilt.",
  "Das erste Nein nicht umdeuten.",
];

function openingFor(seed: ScenarioSeed, hinge: HiddenHinge) {
  const place = seed.objekt || "das Haus";
  if (hinge.id === "reentry" || hinge.id === "clear-no") {
    return `Guten Tag. Wir haben schon gesprochen. Ich habe gesagt, dass ich nicht verkaufe. Warum rufen Sie noch einmal an?`;
  }
  if (hinge.id === "cautious-yes") {
    return `Guten Tag. Ja, wir hatten schon Kontakt. Warum rufen Sie jetzt nochmal an?`;
  }
  if (hinge.id === "honor") {
    return `Guten Tag. Ich vergleiche gerade. Warum soll ich mit Ihnen sprechen?`;
  }
  return `Guten Tag. Ja, ${place} — das gehört uns. Warum rufen Sie an?`;
}

function privateFromHinge(hinge: HiddenHinge): AuthoredPrivate {
  return {
    wellbeing: hinge.wellbeing,
    sell_will: hinge.sellWill,
    prior_talk: hinge.priorTalk,
    constitution: hinge.constitution,
    disclosure: hinge.disclosure,
  };
}

export function leaksPrivate(text: string, priv: AuthoredPrivate, allowed = "") {
  const hay = text.toLowerCase();
  const allowedHay = allowed.toLowerCase();
  const needles = [priv.sell_will, priv.wellbeing, priv.constitution, priv.prior_talk]
    .flatMap((part) => part.split(/[.!?]/).map((s) => s.trim().toLowerCase()))
    .filter((part) => part.length > 18)
    .filter((part) => !allowedHay.includes(part));
  return needles.some((needle) => hay.includes(needle));
}

function normalizeGuide(guide: CallGuide | undefined, fallback: CallGuide): CallGuide {
  const lines = (guide?.lines ?? []).map((l) => l.trim()).filter(Boolean);
  const avoid = (guide?.avoid ?? []).map((l) => l.trim()).filter(Boolean);
  const questions = (guide?.questions ?? []).map((l) => l.trim()).filter(Boolean);
  return {
    occasion: guide?.occasion?.trim() || fallback.occasion,
    presumed: guide?.presumed?.trim() || fallback.presumed,
    lines: lines.length >= 3 ? lines.slice(0, 8) : fallback.lines,
    avoid: avoid.length > 0 ? avoid.slice(0, 6) : fallback.avoid,
    questions: questions.length > 0 ? questions.slice(0, 6) : fallback.questions,
  };
}

function guideText(guide: CallGuide) {
  return [guide.occasion, guide.presumed, ...guide.lines, ...guide.avoid, ...guide.questions].join("\n");
}

export function mockGenerateScenario(raw: Partial<ScenarioSeed>): Omit<GeneratedScenario, "id" | "updated_at"> {
  const seed = normalizeSeed(raw);
  const hinge = pickHiddenHinge(seed);
  const name = inferName(seed);
  const profession = inferProfession(seed);
  return {
    engine: "mock",
    title: titleFromSeed(seed, hinge.titleHint),
    counterpartName: name,
    profession,
    public_brief: composePublicBrief(seed),
    opening: openingFor(seed, hinge),
    acceptable_outcome: hinge.outcome,
    private_state: privateFromHinge(hinge),
    hard_constraints: HARD,
    knowledge_card_ids: hinge.id === "shared" ? ["K02", "K03"] : hinge.kind === "reentry" ? ["K02", "K05"] : ["K02"],
    draft: true,
    packSeed: false,
    verticalId: seed.verticalId || "immobilien",
    situation: seed.situation,
    guide: hinge.guide,
  };
}

export type ModelDraft = {
  title?: string;
  counterpartName?: string;
  profession?: string;
  opening?: string;
  acceptable_outcome?: string;
  public_brief?: string;
  private_state?: Partial<AuthoredPrivate>;
  guide?: Partial<CallGuide> & { lines?: string[]; avoid?: string[]; questions?: string[] };
};

/** Ein verdeckter Zustand braucht einen Satz, kein Stichwort („gesund“, „unentschlossen“). */
export function usablePrivateValue(value: string | undefined): value is string {
  const v = (value ?? "").trim();
  return v.length >= 25 && /\s/.test(v) && v.split(/\s+/).length >= 4;
}

/**
 * Die Gegenseite wird angerufen — ihr erster Satz ist der eines Menschen, der abhebt.
 * Klingt die Eröffnung wie der Anrufer („hier spricht X, ich habe gehört, Sie …“), ist die Rolle vertauscht.
 */
export function openingSoundsLikeCaller(opening: string, situation = "") {
  const inbound = /kund(e|in) ruft|hat angerufen|ruft (uns|bei uns|an)|meldet sich|inbound|eingehend/i.test(situation);
  if (inbound) return false;
  return /hier spricht|mein name ist .{0,40}(ich rufe|ich melde|ich habe gehört|ich wollte)|ich habe gehört, (dass )?sie|ich rufe (sie )?an|ich wollte (sie )?fragen, ob sie|sie beschäftigen sich mit|sie sind doch (makler|berater)/i.test(
    opening,
  );
}

export function sanitizeGeneratedDraft(
  json: ModelDraft,
  mock: ReturnType<typeof mockGenerateScenario>,
): ReturnType<typeof mockGenerateScenario> {
  const pickPrivate = (key: keyof AuthoredPrivate) => {
    const value = json.private_state?.[key];
    return usablePrivateValue(value) ? value.trim() : mock.private_state[key];
  };
  const priv: AuthoredPrivate = {
    wellbeing: pickPrivate("wellbeing"),
    sell_will: pickPrivate("sell_will"),
    prior_talk: pickPrivate("prior_talk"),
    constitution: pickPrivate("constitution"),
    disclosure: pickPrivate("disclosure"),
  };
  const allowed = mock.public_brief;
  const rawOpening = json.opening?.trim() || mock.opening;
  const opening = openingSoundsLikeCaller(rawOpening, mock.situation) ? mock.opening : rawOpening;
  let outcome = json.acceptable_outcome?.trim() || mock.acceptable_outcome;
  if (leaksPrivate(outcome, priv, allowed)) outcome = mock.acceptable_outcome;
  let guide = normalizeGuide(json.guide as CallGuide | undefined, mock.guide!);
  if (leaksPrivate(guideText(guide), priv, allowed)) guide = mock.guide!;
  return {
    ...mock,
    engine: "openai",
    title: json.title?.trim() || mock.title,
    counterpartName: json.counterpartName?.trim() || mock.counterpartName,
    profession: json.profession?.trim() || mock.profession,
    public_brief: mock.public_brief,
    opening: leaksPrivate(opening, priv, allowed) ? mock.opening : opening,
    acceptable_outcome: outcome,
    private_state: priv,
    guide,
  };
}

async function llmComplete(seed: ScenarioSeed, mock: ReturnType<typeof mockGenerateScenario>, signal?: AbortSignal) {
  const hinge = pickHiddenHinge(seed);
  const json = (await completeJson(
    `Du bereitest ein Telefonat für Wiener Investmentmakler vor (de-AT, Anrede Sie).
Der Nutzer beschreibt eine mögliche Gesprächslage in eigenen Worten. Daraus machst du:
1) ein Roleplay mit öffentlichem Briefing und verdecktem Zustand
2) einen Leitfaden zur Orientierung — kein Teleprompter, keine ganze Rede

Regeln:
- public_brief darf NUR enthalten, was der Nutzer geschrieben hat (Situation, optionales Gegenüber/Objekt/Bisher). Keine neuen Fakten.
- private_state ist synthetisch und darf der Vermutung des Nutzers widersprechen. Nicht in public_brief oder Leitfaden als Tatsache kippen.
- private_state: jeder Wert 1–2 volle Sätze aus dem Leben dieser Person (was sie will, was sie erlebt hat, was sie nicht sagt) — keine Stichwörter wie „gesund“ oder „unentschlossen“. Die Werte dürfen einander nicht widersprechen (wer laut sell_will nicht verkauft, hat laut prior_talk keinen Auftrag vergeben).
- disclosure: eine konkrete Bedingung („erst wenn der Anrufer nach … fragt“), keine Haltung („zurückhaltend“).
- Leitfaden.presumed bleibt Vermutung („kann sein“), kein Spoiler der verdeckten Wahrheit.
- opening: erster Satz der Gegenseite, ohne Hidden State. Die Gegenseite wird in der Regel ANGERUFEN — sie hebt ab und reagiert („Ja? … Warum rufen Sie an?“), sie stellt sich nicht als Anruferin vor. Nur wenn die Situation ausdrücklich sagt, dass die Kundin oder der Kunde anruft, beginnt sie mit ihrem Anliegen.
- Übernimm Alter, Beruf, Tonfall und Region der Gegenseite aus der Nutzerbeschreibung in counterpartName/profession und in private_state.wellbeing (z. B. „66, Buchhalter, trocken, tiefe Stimme“) — das steuert später Stimme und Sprechweise.
- Keine erfundenen Käufer, Marktpreise, Konkurrenzhonorare.
- Ziel ist ein nächster angemessener Schritt, kein Fake-Abschluss.
JSON: {
  "title": string,
  "counterpartName": string,
  "profession": string,
  "public_brief": string,
  "opening": string,
  "acceptable_outcome": string,
  "private_state": {
    "wellbeing": string,
    "sell_will": string,
    "prior_talk": string,
    "constitution": string,
    "disclosure": string
  },
  "guide": {
    "occasion": string,
    "presumed": string,
    "lines": string[],
    "avoid": string[],
    "questions": string[]
  }
}`,
    JSON.stringify({
      seed,
      hinge: { id: hinge.id, kind: hinge.kind, sellWill: mock.private_state.sell_will },
      nameHint: mock.counterpartName,
      professionHint: mock.profession,
      publicBriefLocked: mock.public_brief,
    }),
    { purpose: "generate", signal },
  )) as ModelDraft;

  return sanitizeGeneratedDraft(json, mock);
}

export async function generateAuthoredScenario(
  raw: Partial<ScenarioSeed>,
  opts?: { signal?: AbortSignal },
): Promise<GeneratedScenario> {
  const seed = normalizeSeed(raw);
  if (!seedHasContent(seed)) {
    throw new Error("Bitte die Situation beschreiben.");
  }
  let draft = mockGenerateScenario(seed);
  if (hasLlmKey()) {
    try {
      draft = await llmComplete(seed, draft, opts?.signal);
    } catch (e) {
      if (opts?.signal?.aborted) throw e;
    }
  }
  const { engine, ...rest } = draft;
  const saved = saveAuthored({
    ...rest,
    id: `A-${randomUUID().slice(0, 8)}`,
  });
  return { ...saved, engine };
}
