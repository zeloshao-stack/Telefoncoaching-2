# CHG-20260918-004 — Role Player Realismus vs ChatGPT Voice / GPT-6 Astra

```yaml
change_id: CHG-20260918-004
raw_request: "die gesprächs rollen engine ist schwach - das ist absolut nicht realistisch - open ai astra 6 hat da gestern ohne jegliches hintergurundwissen wesentlich besser funktioniert - ohne dieses programm hier - also dass müssen wir besser hinkriegen"
user_outcome: "Die Gegenseite am Hörer wirkt wie ein Mensch im Telefonat, nicht wie ein Regelautomat. Ein Nutzer ohne App-Wissen soll das Gespräch für glaubwürdig halten."
acceptance_criteria:
  - "Role-Player-Instructions sind Person + Lage zuerst, nicht Checklisten-Wand; INNERES/STIMME steuern, werden nicht gesprochen"
  - "Live-Default ist kein Mini-Modell mehr; REALTIME_MODEL-Override und Fallback bleiben"
  - "Text-Roleplay bekommt den gesprochenen Verlauf als Gespräch, nicht nur observations+lastTrainee JSON; Äußerung wie am Telefon, nicht 35-Wort-Telegramm"
  - "Role Player sieht keine Rubrik, kein Trainee-Ziel, kein Evaluator"
  - "Bestehende Isolation- und S01–S03-Tests grün; Live-Prompt bleibt unter 3000 Zeichen"
  - "Kein Produktclaim „so gut wie Astra“; Qualität = PLAUSIBEL bis Blindtest"
non_goals:
  - "Billing, Mandanten, Avatare, Studio, Evaluator-Umbau, Coaching-UI"
  - "gpt-6-astra als Live-Sprachmodell (API: kein Audio)"
  - "A13 Character-Rewrite ohne Nachweis, dass die Prompt/Modell-Drossel nicht der Engpass ist"
  - "Playback-Ack, VAD-Experiment, episodischer Speicher (CHG-003 defer)"
primary_owner: A07
reviewer: K07
secondary: []
affected_features: [role-player, live-call, text-call]
candidate_modules:
  - src/role-engine/persona-prompt.ts
  - src/role-engine/openaiAdapter.ts
  - lib/llm.ts
  - lib/openai-realtime.ts
  - .env.example
contracts_at_risk:
  - "Role Player isolation (keine Rubrik)"
  - "Realtime session.model Default"
  - "Live-Prompt < 3000"
data_migrations: []
targeted_tests:
  - src/role-engine/__tests__/persona.test.ts
  - src/role-engine/__tests__/a09-s01-s03.battery.test.ts
  - lib/__tests__/openai-realtime.test.ts
quality_effect: "PLAUSIBEL höhere Gesprächsglaubwürdigkeit; VERIFIZIERT nur Test-Regression, nicht MOS"
cost_effect: "PLAUSIBEL höherer Live-Minutenpreis (volles Realtime statt mini); per Env rücksetzbar"
risk_level: high
context_budget_tokens: 8000
full_scan_reason: null
status: IN_ARBEIT
```

## A00 Routing

- **Primär A07** — Role Player ist überpromptet und untermotorisiert. Feature-Map: `role-player` → A07.
- **Kein A13 in dieser Karte**, solange der Engpass Prompt + Modell ist. Character-Sheets (CHG-002) bleiben.
- **Kein A06**, außer A07 muss Session-Config außer `model` und Instructions anfassen.
- **A12 nicht blockierend**: Default-Modellwechsel muss in `.env.example` und Entscheidung stehen; Mini bleibt Override.
- **A09**: Vergleich mit Astra ist Anwenderbeobachtung (eine Sitzung, nicht verblindet). Kein 2×- oder Paritäts-Claim.

## Diagnose (A00, PLAUSIBEL)

ChatGPT Voice (GPT-Live für Sprache, Astra nur bei Reasoning) vs. dieses Programm:

1. Live-Default `gpt-realtime-2.1-mini` (`lib/openai-realtime.ts`).
2. Text-Default `gpt-4o`, `response_format: json_object`, Hardcap „~35 Wörter“, User-Payload nur `{observations, lastTrainee}`.
3. `personaCore` stapelt INNERES, STIMME, REGISTER, REGELN, Hangup, Idioms, Assistenten-Verbote — das Modell spielt die Liste, nicht die Person.

Astra in der API hat **kein Audio**. Nächstes Live-Analog: volles Realtime, nicht Mini, und ein Prompt, in dem ein starkes Modell überhaupt spielen kann.
