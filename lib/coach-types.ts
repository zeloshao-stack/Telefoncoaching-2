export type CoachMessage = {
  id: string;
  role: "user" | "coach" | "system";
  text: string;
  createdAt: string;
};

export type CoachThread = {
  id: string;
  title: string;
  sessionId: string | null;
  engineMode: string;
  createdAt: string;
  updatedAt: string;
  verticalId: string;
  messages: CoachMessage[];
};

export type CoachThreadSummary = {
  id: string;
  title: string;
  sessionId: string | null;
  updatedAt: string;
  verticalId: string;
};
