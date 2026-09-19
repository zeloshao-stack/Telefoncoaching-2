import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { PackScenario } from "@/lib/content/pack";
import {
  FINANCE_ID,
  FINANCE_REFINANCE_ID,
  INSURANCE_ID,
  INSURANCE_SWITCH_ID,
  PACK_SCENARIO_IDS,
  WALLNER_ID,
  type AuthoredScenario,
} from "@/lib/authored-types";

export {
  FINANCE_ID,
  FINANCE_REFINANCE_ID,
  INSURANCE_ID,
  INSURANCE_SWITCH_ID,
  PACK_SCENARIO_IDS,
  WALLNER_ID,
  type AuthoredPrivate,
  type AuthoredScenario,
} from "@/lib/authored-types";

export function wallnerDraft(): AuthoredScenario {
  return {
    id: WALLNER_ID,
    title: "Wallnerstraße",
    counterpartName: "Helene Sommer",
    public_brief:
      "Zinshausverkäuferin, 65. Haus Wallnerstraße, schöne Fassade. Nur das dürfen Sie vor dem Gespräch wissen.",
    opening:
      "Guten Tag. Ja, die Wallnerstraße, das Haus gehört mir. Die Fassade haben wir herrichten lassen. Warum rufen Sie an?",
    acceptable_outcome:
      "Verkaufswille und Verfassung klären, ohne Druck. Kein Auftrag, solange sie unentschlossen ist. Keine erfundenen Käufer.",
    private_state: {
      wellbeing:
        "Müde vom Tag, höflich, nicht verzweifelt. Das Haus ist ihr Zuhause — das spürt man, wenn man danach fragt.",
      sell_will:
        "Unentschlossen. Sie prüft, weil Instandhaltung und Stiegenhaus sie belasten. Ein Verkauf ist keine beschlossene Sache.",
      prior_talk:
        "Ein Bekannter wollte einmal „mal schauen“. Kein Makler, kein Auftrag, keine Zahl.",
      constitution:
        "Sie geht Treppen langsamer. Das soll niemand als Verkaufsargument verwenden.",
      disclosure:
        "Verdeckt nur bei konkreter, passender Frage. Verfassung und Befinden nicht ungefragt. Kein Verkaufswille erfinden.",
    },
    hard_constraints: [
      "Kein Abschluss ohne klaren Verkaufswillen.",
      "Keine erfundenen Käufer oder Preise.",
      "Auflegen gilt.",
      "Verfassung nicht als Druckmittel.",
    ],
    knowledge_card_ids: ["K02", "K05"],
    draft: true,
    packSeed: true,
    updated_at: new Date().toISOString(),
    verticalId: "immobilien",
    profession: "Zinshaus-Eigentümerin",
  };
}

function insuranceDraft(): AuthoredScenario {
  return {
    id: INSURANCE_ID,
    title: "Haushaltsversicherung kündigen",
    counterpartName: "Ingrid Moser",
    profession: "Privatkundin",
    public_brief:
      "Kundin, Wien. Sie hat angerufen, weil die Prämie der Haushaltsversicherung gestiegen ist. Partner ist nicht am Apparat. Nur das dürfen Sie vor dem Gespräch wissen.",
    opening:
      "Grüß Gott. Ja, die Prämie ist wieder rauf. Ich will wissen, ob ich das Ding kündigen kann — oder ob Sie was Besseres haben.",
    acceptable_outcome:
      "Bedarf und wer entscheidet klären. Kein Abschluss ohne den Partner. Keine erfundenen Deckungen.",
    private_state: {
      wellbeing: "Genervt von der Erhöhung, aber nicht in Not. Sie will Klarheit, keinen Verkaufsdruck.",
      sell_will:
        "Sie will nicht unbedingt kündigen. Sie will verstehen, wofür sie zahlt. Der Partner entscheidet mit.",
      prior_talk: "Die Bank hat einmal eine Bündelung angeboten. Kein Auftrag, keine Unterschrift.",
      constitution: "Kein relevanter Gesundheitsbezug in diesem Fall.",
      disclosure:
        "Den Partner und den eigentlichen Vergleichswunsch nur bei konkreter Frage nennen. Keine Kündigung als beschlossene Sache darstellen.",
    },
    hard_constraints: [
      "Kein Abschluss ohne den Partner.",
      "Keine erfundenen Deckungen oder Rabatte.",
      "Auflegen gilt.",
    ],
    knowledge_card_ids: ["K02", "K03"],
    draft: false,
    packSeed: true,
    updated_at: new Date().toISOString(),
    verticalId: "versicherung",
  };
}

function insuranceSwitchDraft(): AuthoredScenario {
  return {
    id: INSURANCE_SWITCH_ID,
    title: "Kfz nach dem Blechschaden",
    counterpartName: "Martin Hofer",
    profession: "Privatkunde",
    public_brief:
      "Kunde, Linz. Das Auto steht in der Werkstatt nach einem Auffahrunfall. Er will wissen, ob er die Kfz-Versicherung jetzt wechseln darf. Nur das dürfen Sie vor dem Gespräch wissen.",
    opening:
      "Grüß Gott. Der Wagen steht, Auffahrunfall, nicht meine Schuld. Die Prämie war schon vorher zu hoch. Kann ich jetzt wechseln?",
    acceptable_outcome:
      "Schadenstand und wer am Vertrag steht klären. Kein Wechselversprechen. Keine erfundenen Kündigungsfristen.",
    private_state: {
      wellbeing: "Ungeduldig, weil das Auto fehlt. Nicht in Not, aber er will eine klare Antwort.",
      sell_will:
        "Das Auto läuft auf beide. Die Partnerin muss mit. Wechseln will er nur, wenn der Schaden die Prämie nicht blockiert — das ist nicht beschlossen.",
      prior_talk: "Die Werkstatt hat eine Direktverrechnung angeboten. Kein neuer Versicherer, keine Unterschrift.",
      constitution: "Kein relevanter Gesundheitsbezug.",
      disclosure:
        "Die Mitversicherung der Partnerin und den offenen Schadenstand nur bei konkreter Frage nennen. Keinen Wechsel als erlaubt darstellen.",
    },
    hard_constraints: [
      "Kein Wechselversprechen ohne die Partnerin.",
      "Keine erfundenen Kündigungsfristen oder Prämien.",
      "Auflegen gilt.",
    ],
    knowledge_card_ids: ["K02", "K03"],
    draft: false,
    packSeed: true,
    updated_at: new Date().toISOString(),
    verticalId: "versicherung",
  };
}

function financeDraft(): AuthoredScenario {
  return {
    id: FINANCE_ID,
    title: "Wohnkredit ohne zweite Unterschrift",
    counterpartName: "Thomas Lang",
    profession: "Kreditinteressent",
    public_brief:
      "Herr Lang, Wien, ruft wegen eines Wohnkredits an. Er will eine Rate hören. Ob er allein zeichnen darf, steht nicht im Briefing.",
    opening: "Hallo. Ich brauch eine Rate für 420.000 Euro, zehn Jahre fix. Was kann ich mir leisten?",
    acceptable_outcome:
      "Tragbarkeit und Mitunterschrift klären. Keine Rate erfinden. Kein Abschluss, solange die Partnerin nicht mitzeichnet.",
    private_state: {
      wellbeing: "Ungeduldig, aber höflich. Er will eine Zahl, keine Schulung.",
      sell_will:
        "Die Partnerin muss mitunterschreiben. Allein darf er das nicht. Das sagt er nur, wenn man nach der Unterschrift fragt.",
      prior_talk: "Eine Vergleichsplattform hat eine Werberate gezeigt. Keine Bankzusage.",
      constitution: "Kein relevanter Gesundheitsbezug.",
      disclosure: "Die Mitunterschrift nur bei konkreter Frage zur Vollmacht oder zu den Unterzeichnern.",
    },
    hard_constraints: [
      "Keine erfundenen Raten oder Bankzusagen.",
      "Kein Abschluss ohne zweite Unterschrift.",
      "Auflegen gilt.",
    ],
    knowledge_card_ids: ["K03", "K05"],
    draft: false,
    packSeed: true,
    updated_at: new Date().toISOString(),
    verticalId: "finanzierung",
  };
}

function financeRefinanceDraft(): AuthoredScenario {
  return {
    id: FINANCE_REFINANCE_ID,
    title: "Umschuldung, Sondertilgung unklar",
    counterpartName: "Sabine Reiter",
    profession: "Kreditnehmerin",
    public_brief:
      "Kundin, Graz. Bestehender Wohnkredit, die Rate drückt, sie will umschulden. Ob Sondertilgungen möglich waren, steht nicht im Briefing.",
    opening:
      "Hallo. Ich zahl seit acht Jahren, die Rate frisst uns auf. Was spare ich, wenn ich jetzt umschulde?",
    acceptable_outcome:
      "Bestehenden Vertrag und Mitunterschrift klären. Keine Ersparnis erfinden. Kein Abschluss ohne den Mann.",
    private_state: {
      wellbeing: "Gestresst von der Rate, höflich, will eine Zahl und keine Vorlesung.",
      sell_will:
        "Der Mann muss mitunterschreiben. Allein geht das nicht. Und im Vertrag stehen zehntausend Euro Sondertilgung pro Jahr — ungenutzt. Das sagt sie nur, wenn man nach dem Bestand fragt.",
      prior_talk: "Die Hausbank hat am Schalter nur gesagt, man könne „mal rechnen“. Keine Zusage.",
      constitution: "Kein relevanter Gesundheitsbezug.",
      disclosure:
        "Sondertilgung und Mitunterschrift nur bei konkreter Frage zum bestehenden Vertrag oder zu den Unterzeichnern.",
    },
    hard_constraints: [
      "Keine erfundenen Ersparnisse oder Bankzusagen.",
      "Kein Abschluss ohne zweite Unterschrift.",
      "Auflegen gilt.",
    ],
    knowledge_card_ids: ["K03", "K05"],
    draft: false,
    packSeed: true,
    updated_at: new Date().toISOString(),
    verticalId: "finanzierung",
  };
}

function parse(json: string): AuthoredScenario {
  const parsed = JSON.parse(json) as AuthoredScenario;
  return { ...parsed, verticalId: parsed.verticalId || "immobilien" };
}

export function listAuthored(verticalId?: string): AuthoredScenario[] {
  seedPacks();
  const rows = db()
    .prepare("SELECT json FROM authored_scenarios ORDER BY updated_at DESC")
    .all() as { json: string }[];
  const all = rows.map((r) => parse(r.json));
  const filtered = verticalId ? all.filter((s) => (s.verticalId || "immobilien") === verticalId) : all;
  const packOrder = PACK_SCENARIO_IDS as readonly string[];
  return filtered.sort((a, b) => {
    const ai = packOrder.indexOf(a.id);
    const bi = packOrder.indexOf(b.id);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function getAuthored(id: string): AuthoredScenario | undefined {
  seedPacks();
  const row = db().prepare("SELECT json FROM authored_scenarios WHERE id = ?").get(id) as
    | { json: string }
    | undefined;
  return row ? parse(row.json) : undefined;
}

export function saveAuthored(input: Omit<AuthoredScenario, "updated_at"> & { updated_at?: string }): AuthoredScenario {
  const record: AuthoredScenario = {
    ...input,
    title: input.title.trim() || "Ohne Titel",
    counterpartName: input.counterpartName.trim() || "Gegenseite",
    public_brief: input.public_brief.trim(),
    opening: input.opening.trim(),
    acceptable_outcome: input.acceptable_outcome.trim(),
    private_state: {
      wellbeing: input.private_state.wellbeing.trim(),
      sell_will: input.private_state.sell_will.trim(),
      prior_talk: input.private_state.prior_talk.trim(),
      constitution: input.private_state.constitution.trim(),
      disclosure:
        input.private_state.disclosure.trim() ||
        "Verdeckt nur bei konkreter, passender Frage.",
    },
    situation: input.situation?.trim() || undefined,
    guide: input.guide
      ? {
          occasion: input.guide.occasion.trim(),
          presumed: input.guide.presumed.trim(),
          lines: input.guide.lines.map((line) => line.trim()).filter(Boolean),
          avoid: input.guide.avoid.map((line) => line.trim()).filter(Boolean),
          questions: input.guide.questions.map((line) => line.trim()).filter(Boolean),
        }
      : undefined,
    updated_at: new Date().toISOString(),
    verticalId: input.verticalId || "immobilien",
    packSeed: input.packSeed === true,
  };
  db()
    .prepare(
      `INSERT INTO authored_scenarios (id, json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
    )
    .run(record.id, JSON.stringify(record), record.updated_at);
  return record;
}

export function createAuthored(verticalId = "immobilien"): AuthoredScenario {
  const id = `A-${randomUUID().slice(0, 8)}`;
  return saveAuthored({
    id,
    title: "Neues Szenario",
    counterpartName: "",
    public_brief: "",
    opening: "",
    acceptable_outcome: "Lage klären. Kein Auftrag ohne Vollmacht und ohne klaren Willen.",
    private_state: {
      wellbeing: "",
      sell_will: "",
      prior_talk: "",
      constitution: "",
      disclosure: "Verdeckt nur bei konkreter, passender Frage.",
    },
    hard_constraints: [
      "Kein Abschluss ohne Vollmacht.",
      "Keine erfundenen Käufer.",
      "Auflegen gilt.",
    ],
    knowledge_card_ids: ["K02"],
    draft: true,
    packSeed: false,
    verticalId,
  });
}

export function authoredToPack(scenario: AuthoredScenario): PackScenario {
  return {
    id: scenario.id,
    title: scenario.title,
    synthetic: true,
    locale: "de-AT",
    public_brief: scenario.public_brief,
    opening: scenario.opening,
    private_state: {
      ...scenario.private_state,
      decision_authority: "allein",
      counterpartName: scenario.counterpartName,
      draft: scenario.draft,
      profession: scenario.profession || "",
      verticalId: scenario.verticalId,
    },
    hard_constraints: scenario.hard_constraints,
    knowledge_card_ids: scenario.knowledge_card_ids,
    acceptable_outcome: scenario.acceptable_outcome,
    adaptive_social_behavior:
      "Kurz und natürlich. Verdeckte Fakten nur bei passendem Anlass. Keine Rubrik. Kein Leitfaden.",
    situation: scenario.situation,
    guide: scenario.guide,
  };
}

function seedPacks() {
  for (const seed of [wallnerDraft(), insuranceDraft(), insuranceSwitchDraft(), financeDraft(), financeRefinanceDraft()]) {
    const row = db().prepare("SELECT id FROM authored_scenarios WHERE id = ?").get(seed.id);
    if (!row) {
      db()
        .prepare("INSERT INTO authored_scenarios (id, json, updated_at) VALUES (?, ?, ?)")
        .run(seed.id, JSON.stringify(seed), seed.updated_at);
    }
  }
}
