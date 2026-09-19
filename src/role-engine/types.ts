export const ROLE_SCHEMA_VERSION = "role-character/2" as const;

export type ObservationType =
  | "introduced_self"
  | "gave_clear_reason_for_call"
  | "generic_pitch"
  | "unsupported_claim"
  | "referenced_previous_statement"
  | "asked_specific_question"
  | "asked_generic_question"
  | "acknowledged_concern"
  | "ignored_boundary"
  | "created_pressure"
  | "showed_relevant_market_knowledge"
  | "made_false_or_unverifiable_claim"
  | "interrupted_character"
  | "respected_no"
  | "continued_after_final_no"
  | "answered_direct_question"
  | "failed_to_answer_direct_question"
  | "humor_attempt"
  | "personal_connection_attempt"
  | "premature_concession"
  | "premature_close"
  | "clarified_decision_authority";

export type Observation = {
  type: ObservationType;
  turnId: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
};

/** Wie der Anruf zustande kam — steuert Geduld und Auflege-Neigung. */
export type CallOrigin = "cold" | "warm" | "inbound";

export type HangupReason =
  | "no_reason_to_continue"
  | "boundary_ignored"
  | "time_exhausted"
  | "abuse"
  | "final_no"
  | "character_choice";

export type RealtimeVoice =
  | "alloy"
  | "ash"
  | "ballad"
  | "coral"
  | "echo"
  | "sage"
  | "shimmer"
  | "verse"
  | "marin"
  | "cedar";

export type CharacterState = {
  status: "active" | "ending" | "ended" | "interrupted";
  trust: number;
  interest: number;
  irritation: number;
  timeWillingness: number;
  perceivedCompetence: number;
  salesPressure: number;
  disclosedFacts: string[];
  stateRevision: number;
  /** Innere Gefühlslage — nicht die Rubrik. Fehlt in alten Sitzungen, wird hydriert. */
  affect?: CharacterAffect;
  /** Warum die Figur aufgelegt hat — für die Auswertung, nicht fürs Gespräch. */
  hangupReason?: HangupReason;
  /** Was den Auflege-Entschluss ausgelöst hat (kurzer Trigger, kein Zitat der Rubrik). */
  hangupTrigger?: string;
};

/** Was am Ohr ankommt: Prosodie, nicht der Wortlaut. */
export type AcousticSample = {
  durationMs: number;
  meanEnergy: number;
  peakEnergy: number;
  voicedMs?: number;
};

export type VocalRate = "slow" | "calm" | "normal" | "fast" | "rushed";
export type VocalIntensity = "soft" | "normal" | "loud";
export type VocalWarmth = "cold" | "neutral" | "warm" | "smiling";

export type VocalChannel = {
  rate: VocalRate;
  intensity: VocalIntensity;
  warmth: VocalWarmth;
  laughter: boolean;
  backchannel: boolean;
  smileCue: boolean;
  overlapping: boolean;
  controllingLanguage: boolean;
  soothingLanguage: boolean;
  wordsPerMinute: number | null;
  meanEnergy: number | null;
};

/**
 * Benannte psychologische Abläufe, nicht nur Deltas.
 * co_regulation: ruhige Stimme senkt Erregung (Safety-Cue).
 * contagion: Erregung/Wärme des Anrufers färbt ab.
 * reactance: Druck und Provokation → Ärger, Autonomie schützen.
 * face_threat: Unterbrechung, übergangene Grenze.
 * affiliation: Lachen, Mhm, Lächeln in der Stimme.
 * withdrawal: Überlastung, Auflegen naht.
 */
export type AffectProcess =
  | "co_regulation"
  | "contagion"
  | "reactance"
  | "face_threat"
  | "affiliation"
  | "withdrawal";

export type VoiceDelivery = {
  mood: "neutral" | "calm" | "skeptical" | "impatient" | "warm" | "sad" | "cheerful";
  rate: "slower" | "even" | "faster";
  volume: "softer" | "even" | "firmer";
  warmth: "flat" | "neutral" | "warm" | "smiling";
  breath: "held" | "normal" | "sigh";
};

export type CharacterAffect = {
  arousal: number;
  feltSafety: number;
  affiliation: number;
  valence: number;
  process: AffectProcess;
  voice: VoiceDelivery;
};

export type HiddenFact = {
  id: string;
  fact: string;
  knownBy: "character" | "coOwner" | "family" | "advisor" | "other";
  disclosureRule: string;
  disclosureSensitivity: "low" | "medium" | "high";
  status: "private" | "proposed" | "disclosed";
};

export type CharacterTraits = {
  talkativeness: number;
  skepticism: number;
  dominance: number;
  patience: number;
  humor: number;
  detailOrientation: number;
  conflictAvoidance: number;
  riskTolerance: number;
  controlNeed: number;
};

export type BehaviourPolicy = {
  sentenceLength: "short" | "medium" | "elaborate";
  directness: number;
  emotionalExpression: number;
  interruptionTendency: number;
  questionFrequency: number;
  selfDisclosure: number;
  smalltalkAffinity: number;
  toleranceForSalesLanguage: number;
  needForSpecificity: number;
  decisionSpeed: number;
};

export type Identity = {
  name: string;
  region: string;
  profession: string;
  ownershipContext: string;
  marketExperience: "low" | "medium" | "high";
  decisionAuthority: "none" | "partial" | "full";
  /** Optional — fehlt bei alten Figuren, dann wird deterministisch abgeleitet. */
  age?: number;
  gender?: "female" | "male";
};

/** Biografische Anker, die der Sprechprompt braucht — alles synthetisch, nichts davon ist Rubrik. */
export type PersonaAnchors = {
  /** Was die Person gerade tut, während das Telefon läutet. */
  situationNow: string;
  /** Was sie selbst von diesem Anruf will (aus ihrer Sicht, nicht aus Trainee-Sicht). */
  agenda: string;
  /** 2–3 typische Wendungen, sparsam, nie zweimal. */
  idioms: string[];
  /** Was diese Person nie sagen würde. */
  taboos: string[];
};

/** Eine Bindung der Figur — keine Rubrik, kein Trainee-Ziel. */
export type CharacterRelationship = {
  person: string;
  bond: string;
  tension: string;
};

/**
 * Innenleben der Figur für den Role Player.
 * Keine Bewertungsrubrik, keine Trainee-Ziele, keine Scores.
 */
export type InnerLife = {
  relationships: CharacterRelationship[];
  openGoal: string;
  hiddenGoal: string;
  worry: string;
  hope: string;
  innerConflict: string;
};

export type RoleCharacter = {
  schemaVersion: typeof ROLE_SCHEMA_VERSION;
  scenarioId: string;
  scenarioVersion: number;
  synthetic: true;
  identity: Identity;
  traits: CharacterTraits;
  behaviour: BehaviourPolicy;
  hiddenFacts: HiddenFact[];
  hardConstraints: string[];
  opening: string;
  publicBrief: string;
  acceptableOutcome: string;
  initialState: CharacterState;
  /** Optional — wird sonst aus Szenario/Briefing abgeleitet. */
  callContext?: CallOrigin;
  /** Optional — überschreibt das deterministische Voice-Mapping. */
  voice?: RealtimeVoice;
  /** Optional — sonst deterministisch aus Figur und Szenario. */
  persona?: Partial<PersonaAnchors>;
  /** Optional — kanonische Figuren; Generator-Figuren dürfen ohne Inneres laufen. */
  innerLife?: InnerLife;
};

export type TranscriptTurn = {
  id: string;
  speaker: "trainee" | "counterpart" | "system";
  text: string;
};

export type RolePlayerAction = {
  sessionId: string;
  turnId: string;
  expectedStateRevision: number;
  action: "speak" | "wait" | "end_call";
  utterance?: string;
  state: CharacterState;
  observations: Observation[];
  proposedDisclosures: string[];
  endReason?:
    | "no_reason_to_continue"
    | "boundary_ignored"
    | "time_exhausted"
    | "abuse"
    | "final_no"
    | "character_choice";
};

export type RubricDimension =
  | "diagnosis"
  | "truthfulness"
  | "decision_process"
  | "contextual_fit"
  | "commercial_judgment"
  | "next_step";

export type DimensionScore = {
  dimension: RubricDimension;
  score: number | null;
  evidenceTurnIds: string[];
  quote: string;
  rationale: string;
};

/**
 * Der eine Moment, an dem das Gespräch kippte — abgeleitet aus dem verdeckten
 * Zustandsverlauf (Affekt, Vertrauen, Offenlegungen), nicht aus dem Bauchgefühl.
 */
export type KeyMoment = {
  /** Trainee-Turn, der den Wendepunkt ausgelöst hat */
  turnId: string;
  /** Wörtliches Zitat aus diesem Turn */
  quote: string;
  /** Ein Satz: was sich bei der Gegenseite verschoben hat */
  whatHappened: string;
  /** Ein Satz in der Stimme der Gegenseite: was an dieser Stelle funktioniert hätte */
  counterfactual: string;
  source: "affect" | "model" | "rule";
};

export type EvaluationCalibration = {
  clearTraineeTurns: number;
  unclearTraineeTurns: number;
  /** null = keine Scores möglich (kein klarer eigener Beitrag) */
  maxScore: number | null;
  note: string | null;
};

export type Evaluation = {
  engine: "openai" | "mock";
  summary: string;
  strength: string;
  scores: DimensionScore[];
  importantMomentTurnId: string | null;
  correction: string;
  nextStep: string;
  repeatPrompt: string;
  mustNotice: string[];
  abstainNote: string | null;
  /** Fehlt in alten Auswertungen. */
  keyMoment?: KeyMoment | null;
  /** Trainee-Turn, der die Stärke belegt — null: keine belegte Stärke. */
  strengthTurnId?: string | null;
  /** Wörtlicher Satz für das nächste Mal — was Sie an der Stelle sagen könnten. */
  nextLine?: string | null;
  calibration?: EvaluationCalibration;
};
