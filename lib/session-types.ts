import type { HeardCue } from "@/lib/heard";
import type { VoiceId, VoiceMood } from "@/lib/voices";
import type { Evaluation, TranscriptTurn, VoiceDelivery } from "@/src/role-engine/types";

export type PracticeCue = {
  parentId: string;
  lever: string;
  nextStep: string;
  quote: string;
  gapLabel: string | null;
  suggestedLine: string;
};

export type SessionDTO = {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  status: string;
  mode: string;
  parentSessionId: string | null;
  repeatFromTurnId: string | null;
  engineMode: string;
  counterpartName: string;
  voiceId: VoiceId;
  publicBrief: string;
  opening: string;
  turns: TranscriptTurn[];
  evaluation: Evaluation | null;
  createdAt: string;
  verticalId: string;
  focusId: string;
  focusLabel: string;
  practiceCue: PracticeCue | null;
  heard: HeardCue[];
  /** Gesetzt, wenn die Übung aus einem echten Gespräch gestartet wurde */
  realCallId: string | null;
  /** Aktuelle Stimmlage der Figur — steuert TTS, nicht die Auswertung. */
  voiceMood: VoiceMood;
  voiceDelivery: VoiceDelivery;
  voiceFeel: string;
};
