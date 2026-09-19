export const WALLNER_ID = "A01";
export const INSURANCE_ID = "V01";
export const INSURANCE_SWITCH_ID = "V02";
export const FINANCE_ID = "F01";
export const FINANCE_REFINANCE_ID = "F02";
export const PACK_SCENARIO_IDS = [WALLNER_ID, INSURANCE_ID, INSURANCE_SWITCH_ID, FINANCE_ID, FINANCE_REFINANCE_ID] as const;

export type AuthoredPrivate = {
  wellbeing: string;
  sell_will: string;
  prior_talk: string;
  constitution: string;
  disclosure: string;
};

export type CallGuide = {
  occasion: string;
  presumed: string;
  lines: string[];
  avoid: string[];
  questions: string[];
};

export type AuthoredScenario = {
  id: string;
  title: string;
  counterpartName: string;
  public_brief: string;
  opening: string;
  acceptable_outcome: string;
  private_state: AuthoredPrivate;
  hard_constraints: string[];
  knowledge_card_ids: string[];
  draft: boolean;
  packSeed?: boolean;
  updated_at: string;
  verticalId: string;
  profession?: string;
  situation?: string;
  guide?: CallGuide;
};
