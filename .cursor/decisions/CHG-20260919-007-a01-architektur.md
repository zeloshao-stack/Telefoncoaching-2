# CHG-20260919-007 — A01 Architektur-Austausch (Schleife 2)

```yaml
source: a01-systemarchitektur
reviewer: k01-architektur-ausfall
change_id: CHG-20260919-007
status: AUSTAUSCH — kein Code, keine Vertragsänderung im Produkt
date: "2026-09-19"
code: none
go1_go2: unangetastet
provider: gpt-realtime-2.1 WebRTC bleibt
```

## Change Card (A01-Ausschnitt)

```yaml
change_id: CHG-20260919-007
raw_request: "A01 Systemarchitektur mit K01. Schleife 2 AUSTAUSCH. Alle CHG-20260918-006-Dossiers lesen. 5–8 NEUE ADOPT/STEAL/AVOID, die in Schleife 1 bei A01 nicht standen, aus Fremdrollen. Segment: Verträge, State-Besitz, Heard-Cursor, Hangup-Owner, Instruction-Mutability, generation_id."
user_outcome: "A00 sieht, welche fremden Schleife-1-Funde neue Architekturhebel öffnen — nicht eine Wiederholung von CHG-20260918-006-a01."
acceptance_criteria:
  - "5–8 neue ADOPT/STEAL/AVOID, jeweils Fremdrolle + Fund, Architekturgrund, Risiko, Evidenzstufe"
  - "Kein Item, das in CHG-20260918-006-a01-architektur.md schon stand"
  - "Pflicht-A/K-Protokoll; GO-1/GO-2-Dateien unberührt"
  - "Kein Provider-Tausch, kein 2×-Claim, Role Player / State Engine / Evaluator getrennt"
non_goals:
  - "Produktcode, Contract-Rewrite, GO-1/GO-2-Patches"
  - "LiveKit/Pipecat/Vapi/Hume/Gemini als Stack"
  - "Billing, Mandant, Studio, Avatare"
primary_owner: A01
reviewer: K01
full_scan_reason: null
```

---

## Phase 1 — A Auftragsverständnis

```text
AUFTRAGSVERSTÄNDNIS
- gewünschte Nutzerwirkung: Reinhard / A00 kann Architekturhebel aus dem fremden Deepsearch übernehmen, ohne Schleife-1-A01 zu wiederholen und ohne Code.
- betroffene Komponente: Verträge und Besitz (Heard-Cursor, Hangup-Lifecycle, Instruction-Mutability, generation_id, Identitäten). Nicht Transport-Tuning, nicht Prompttext, nicht UX-Copy.
- Nicht Ziele: Code; GO-1/GO-2-Dateien (liveCall.ts, ConversationView, MicPrompt, live-text, persona-prompt, openai-realtime, live-turn); Providerwechsel; 2×-Claim; Examiner-Gym in Gate A bauen.
- Annahmen: Quelle der Wahrheit sind die Dateien unter .cursor/decisions/CHG-20260918-006*.md. A00-Highlights sind nur Anstoß. Schleife-1-A01 ist die Negativliste.
- Unbekannt: ob audio_end_ms im Client bereits State-autoritativ ist (Symbol existiert in liveCall.ts; Besitz unbewiesen). Kein eigener Lauf.
- Akzeptanz: 5–8 neue Items mit Fundstelle, Architekturgrund, Risiko, Evidenzstufe; K01 unabhängig; kein erfundenes VERIFIZIERT.
```

### Negativliste — stand schon in Schleife 1 (A01-006), daher hier verboten als „neu“

Aus `CHG-20260918-006-a01-architektur.md`:

- Gehört ≠ Generiert ≠ Instruction-Ack ≠ Tool-Return
- `session.update`-Vollreplace und `end_call` auf dem S2S-Modell
- `heard_ms` / `heard_text` in die State Engine (als Feldname)
- Hangup discard-on-interrupt
- kein Vollreplace als Anti-Hilfe
- nicht senden: `conversation.item.truncate` auf WebRTC
- Live-1 nur mit Append-Adapter
- kein zweites Framework (LiveKit / Pipecat / Vapi) für Gate A

Aus `CHG-20260918-005-a01-architektur.md` (älter, aber Besitz schon gesetzt — nicht als STEAL ausgeben):

- Audio-Uhr ≠ State-Uhr
- Hangup-Owner = State Engine
- VoicePort vor zweitem Provider
- 300 ms ist kein SLA

---

## Phase 2 — A Impact

```text
IMPACT_PLAN
- Dateien: nur dieses Dossier. Kein Produktcode. GO-1/GO-2 unangetastet.
- Verträge: keine Produktänderung. Ideen für spätere Verträge: Heard-Cursor-Quelle, Unlock-Handshake, call_ended≠call_analyzed, Spoken-Lock, Session-Token, Face/Want-Felder, Prefix-Freeze, Freeze-ID.
- abhängige Rollen (nach BO, nicht jetzt): A04 Unlock/Attempt; A05 Persistenz/Seq; A06 mhm-Gate/audio_end_ms; A07 Spoken-Lock-Text; A09 Freeze-ID-Messung; A11 Token/PII; A12 Prefix/Close; A13 Face/Want.
- Wiederverwendung: Kernel-Trennung Role Player / State Engine / Evaluator; A01-006 Vier-Schichten-Idee bleibt gültig, wird nicht neu verkauft.
- kleinster Umfang: 8 Hebel + Identitätskarte. Kein C4-Rewrite.
- Zieltests: keine in AUSTAUSCH. Jeder Hebel nennt den späteren Nachweis als Hypothese.
- Qualität: UNBEKANNT am Produkt. Kosten: null in dieser Phase.
```

Gelesene Fremddossiers (vollständig, Dateien vor A00-Highlights):

| Datei | Rolle |
|---|---|
| `CHG-20260918-006-a01-architektur.md` | A01 (Negativliste) |
| `CHG-20260918-006-a02-produkte.md` | A02 |
| `CHG-20260918-006-a03-ux.md` | A03 |
| `CHG-20260918-006-a04-webrtc.md` | A04 |
| `CHG-20260918-006-a05-sessions.md` | A05 |
| `CHG-20260918-006-a06-transport.md` | A06 |
| `CHG-20260918-006-a07-prompts.md` | A07 |
| `CHG-20260918-006-a08-drills.md` | A08 |
| `CHG-20260918-006-a09-messung.md` + `…-a09-messprotokoll-v2.md` | A09 |
| `CHG-20260918-006-a10-ops.md` | A10 |
| `CHG-20260918-006-a11-privacy.md` | A11 |
| `CHG-20260918-006-a12-quality-cost.md` | A12 |
| `CHG-20260918-006-a13-figur.md` | A13 |
| `CHG-20260918-006-a14-stimme.md` | A14 |
| `CHG-20260918-006-deepsearch.md` | A00 Karte |

Kein Repository-Vollscan. Gezielter Symbolcheck: `audio_end_ms` existiert bereits in `components/training/liveCall.ts` / `lib/live-text.ts`. Diese Dateien wurden nicht geändert.

---

## Phase 3 — A Ergebnis: acht neue Hebel

Jeder Hebel ist **neu gegenüber A01-006**. Evidenz höchstens so hoch wie die Fremdquelle plus Architekturfolge. Nichts am Produkt gemessen in diesem Chat.

### Identitätskarte (Kontext, kein neunter Hebel)

Fremde IDs dürfen nicht zu vier Besitzern für dieselbe Sache werden. Vorgeschlagene Schichtung, alles **HYPOTHESE**:

| ID | Besitzer | Zweck | Nicht |
|---|---|---|---|
| `session_id` | A05+A11 | Capability-Token, Authz, Löschung | Anzeige, Log-Schlüssel |
| `call_attempt_id` | A04 | ein WebRTC-Connect | Ersatz für session_id |
| `generation_id` | A04+State | eine Assistenten-Äußerung, Unlock | Event-Reihenfolge |
| `sequence_number` | A05 | monotone Session-Events | UUID-Ersatz |
| `heard_ms` | State Engine | was der Nutzer gehört hat | Server-VAD, auto-truncate |
| `freeze_id` | A09 (versiegelt) | Modell+Prompt+Datum für Messung | Role-Player-Kanal |

---

### 1. ADOPT — Heard-Cursor-Quelle = Client-`audio_end_ms` nach mhm-Gate

- **Fremdrolle + Fund:** A06 `CHG-20260918-006-a06-transport.md`: zuerst mhm-Gate (nicht semantic-high), dann Client-`audio_end_ms`. WebRTC auto-truncate ≠ Gehörtes. Testdesign `T_eot`, `T_heard_vs_context`. Gestützt durch A09-v2 §2.3: mhm ≠ Barge-in, Pause ≠ Ende (Methode, nicht deren Bench-Zahlen).
- **Warum Architektur, nicht nur Transport:** A01-006 forderte das *Feld* `heard_ms` in der State Engine, nicht die *Quelle* und nicht die Klassifikation davor. Ohne Vertrag „wer darf EOT setzen“ bleibt `heard_ms` eine Kopie von Server-VAD oder auto-truncate — genau die Schichtverwirrung, die A06 benennt. mhm-Gate ist ein Zustandsübergang (Resume vs Respond), kein Modell-Semantik-Score im Realtime-Pfad.
- **Risiko:** mhm als Barge-in cancel't legitime Sprache (MAJOR Realismus). Server-VAD als Heard-Owner schreibt Context ≠ Gehörtes. Doppelte VAD (A04 AVOID) würde zwei EOT-Uhren erzeugen.
- **Evidenzstufe:** **PLAUSIBEL** (A06-Produktbeobachtung + A09-Methode). Client-Feld existiert bereits; autoritativer State-Besitz **UNBEKANNT**.
- **Nicht:** semantic-high VAD; `conversation.item.truncate`; GO-2 anfassen.
- **Späterer Nachweis (HYPOTHESE):** `T_heard_vs_context` und `T_eot` laut A06; Freeze vs Kandidat nicht in diesem Chat.

### 2. ADOPT — `generation_id`-Unlock erst nach `cancelled` **und** `cleared`

- **Fremdrolle + Fund:** A04 `CHG-20260918-006-a04-webrtc.md`: Unlock erst nach cancelled/cleared; Track-Gate nur mit Clear. HEAD-Lücke: `suppressPlayback` fällt bei `response.created`. Steal bleibt `response.cancel` + `output_audio_buffer.clear`, kein Truncate.
- **Warum Architektur:** `generation_id` ist ein Zwei-Phasen-Commit, kein Client-Timer. Request-Cancel ≠ Ack-Cancelled ≠ Buffer-Cleared ≠ Unlock. A01-006 nannte generation_id im Segment nicht als Handshake. Ohne Vertrag öffnet `response.created` eine neue Generation, während die alte noch spielt (A04-HEAD).
- **Risiko:** Unlock auf `response.created` → Doppelaudio, ungeordnete generation_id, Playback-Ack für die falsche Generation. Timeout ohne Unlock → dauerhaft stumme Leitung (A03 „Leitung offen“).
- **Evidenzstufe:** **PLAUSIBEL** (A04 HEAD-Beobachtung). Am Produkt in diesem Chat nicht reproduziert.
- **Timeout/Fehler (HYPOTHESE, Pflicht für späteren Bau):** Unlock-Deadline; bei Timeout sichtbarer Force-End, kein stilles Hängen. Test: Cancel ohne Clear darf Unlock nicht setzen.
- **Nicht:** GO-2-Dateien jetzt patchen; zweite VAD; `track.stop()` während Barge-in (A04).

### 3. STEAL — `call_ended` ≠ `call_analyzed` (Hangup-Lifecycle ≠ Eval-Lifecycle)

- **Fremdrolle + Fund:** A05 `CHG-20260918-006-a05-sessions.md`: Hangup vor Eval (Retell `call_ended` ≠ `call_analyzed`); `ended_reason` als Session-Feld; Partial RAM / committed turns; Snapshot-Turns als einzige Eval-Quelle. Verstärkt durch A08 Examiner nach Hangup; A02 Coach erst nach Auflegen; A03 drei Enden.
- **Warum Architektur:** A01-006 behandelte Hangup als Interrupt-Discard und (seit 005) als State-Engine-Owner. Neu ist die **zweite Lifecycle-Maschine**: Ende der Stimme ist nicht Start der Bewertung. Evaluator liest nur committed Snapshot nach `call_ended`. Realtime-Pfad bleibt frei von Rubrik und Examiner (Kernel + A08 + A07).
- **Risiko:** Hangup-HTTP wartet auf Eval → Auflegen blockiert oder scheitert (Gate-A-Bruch). Eval auf Partial-RAM → Telefonbuch-Messung an uncommitted Turns (A09 Leakage). Examiner in Live-Instructions → Role-Player sieht Rubrik.
- **Evidenzstufe:** **PLAUSIBEL** (Retell/Vapi-Beobachtung A05; A08/A02 Produktregel). Nicht am eigenen System gemessen.
- **ended_reason (HYPOTHESE, an A03-drei-Enden):** `user_hangup` | `character_hangup` | `disconnect`. Character-Hangup bleibt State-Delta (A13), kein Trainingsziel (A08 AVOID Goal-Hangup).
- **Nicht:** Examiner-Gym in Gate A bauen (A08: nicht solange der 5-Min-Call unglaubwürdig ist). Nur die Grenze jetzt.

### 4. STEAL — Spoken-Lock: emittiertes Assistenten-Audio ist committed

- **Fremdrolle + Fund:** A07 `CHG-20260918-006-a07-prompts.md`: Hume spoken-lock. Isolation halten. STIMME nicht im Vorlesetext.
- **Warum Architektur:** A01-006 trennte Gehört ≠ Generiert ≠ Instruction-Ack. Spoken-Lock ist die **Commit-Regel für die Assistentenseite**: sobald Audio die Leitung verlassen hat, darf weder `session.update` noch ein Prompt-Rewrite den gesprochenen Wortlaut im Context ersetzen. Das ist Instruction-Mutability plus generation_id, nicht Promptstil.
- **Risiko:** Lock via History-Edit/`truncate` — A01-006 und A04 verbieten Truncate auf WebRTC; Cache stirbt (A12). Lock im Role-Player-Text als „sag nichts zweimal“ wird eine Nie-Liste (A13/A09 AVOID).
- **Evidenzstufe:** **PLAUSIBEL** (Hume via A07). Wirkung auf 2.1 **HYPOTHESE**.
- **AVOID in demselben Hebel:** Spoken-Lock **nicht** als `conversation.item.truncate` und **nicht** als Mid-Call-Vollreplace implementieren.
- **Reihenfolge zu Hebel 1 (sonst zwei Wahrheiten):** User-Commit = `heard_ms` aus `audio_end_ms` nach mhm-Gate. Assistant-Commit = Spoken-Lock nach Playout/Ack der `generation_id`. Context darf nur diese beiden Commits kennen.

### 5. ADOPT — `session_id` ist ein Capability-Token, kein Anzeige-Name

- **Fremdrolle + Fund:** A11 `CHG-20260918-006-a11-privacy.md`: Stimme = Personendaten; Session-ID = Token; Transparenzsatz; kein EU/ZDR-Claim. A03 Live-only-Rahmen darf die ID nicht als teilbare URL-Geheimnislosigkeit behandeln.
- **Warum Architektur:** Session-Identität ist Autorisierung, nicht Logging-Schlüssel. DataChannel, Restore, Löschung und Event-Seq hängen an diesem Token. A01-006 hatte keine Identitäts-/Authz-Grenze.
- **Risiko:** Session-ID in Client-URL ohne Auth, in ops-Logs (A10), oder als Freeze-Anzeige → Zugang zu Stimme als Personendaten. Keine Rechtsgarantie (A11).
- **Evidenzstufe:** **PLAUSIBEL** (A11-Katalog). Keine Rechtsprüfung in diesem Chat.
- **Nicht:** Mandant, Billing. `call_attempt_id` und `generation_id` beerben das Token nicht.

### 6. STEAL — Face / Want / Wissensschicht sind State-Engine-Felder

- **Fremdrolle + Fund:** A13 `CHG-20260918-006-a13-figur.md`: Face, Want/Status jetzt, Wissensschichten in State, Repair-Stille. AVOID Hume-Fürsorge, SP-„do not volunteer“ im Prompt, Isolation als Lernziel, Nie-Listen. A08: Figur coacht nicht; AVOID Goal-Hangup.
- **Warum Architektur:** A01-006 hatte keinen Schema-Hebel für psychologischen Zustand. State Engine bleibt autoritativ; Role Player darf Face/Want nur als validierten State sehen, nicht als Rubrik und nicht als Hume-Empathie-Ziel (A14: Emotion über Voice State, nicht Mundtext). Wissensschichten verhindern, dass private Persona ungeprüft in den Player läuft (Kernel).
- **Risiko:** Face/Want als Prompt-Absatz statt State → ungeprüfter LLM-Schreibzugriff. Hangup als Trainingsziel (A08) würde den bestehenden Hangup-Owner (A01-005) korrumpieren — deshalb hier **kein** neuer Hangup-Owner, nur AVOID Goal-Hangup. Isolation als Lernziel vermischt Evaluator und Figur.
- **Evidenzstufe:** **PLAUSIBEL** (A13). Kein Realism-Audit in diesem Chat.
- **Nicht:** Hume-Fürsorge kopieren; Nie-Listen in personaCore; Hangup-Owner neu vergeben.

### 7. ADOPT — Session-Prefix nach Start einfrieren; Mute ≠ Close

- **Fremdrolle + Fund:** A12 `CHG-20260918-006-a12-quality-cost.md` Idee 2+3: Prefix einfrieren (History/Instructions statisch → Cache hält); Session hart schließen wenn tot; Mute schließt nicht. OpenAI Cost-Seite 2026-09-18: Anweisungen mitten in der Session ändern zerstört den Cache; jede Response schickt die Conversation erneut.
- **Warum Architektur:** A01-006 verbot Vollreplace als Anti-Hilfe. Neu ist die **Mutability-Politik nach Session-Start**: auch inkrementelle Instruction-Updates sind verboten, weil sie Identität (A13) und Cache (A12) gleichzeitig zerlegen. Mute≠Close ist ein Lifecycle-Owner: tote WebRTC-Session bleibt ein offener Realtime-Pfad (Geisterstimme, Euro, State ohne Audio).
- **Risiko:** Mid-Call-Rewrite „gegen Hilfe“ erzeugt eine zweite Person und teurere Turns. Mute ohne Close → State lebt, Provider zählt, Nutzer denkt aufgelegt (A03 drei Enden). Close während Barge-in darf GO-2 nicht kreuzen — Bau erst nach A02+BO, nicht in diesem Chat.
- **Evidenzstufe:** Cache-Bruch bei Instruction-Änderung **VERIFIZIERT** als Vendor-Aussage (A12, Primärquelle 2026-09-18). Wirkung auf unsere Figur **HYPOTHESE**. Mute≠Close **PLAUSIBEL** (Live-1-Lehre A12, analog 2.1).
- **Nicht:** Mini als Floor; Providerwechsel; GO-2 Mic-Stop umdeuten; stilles Kostencap das den Call tötet (A12 AVOID).

### 8. ADOPT — Freeze-ID versiegeln; nie auf den Role-Player-Kanal

- **Fremdrolle + Fund:** A09 `CHG-20260918-006-a09-messprotokoll-v2.md` Reporting-Pflicht: Freeze-ID = Modell+Prompt+Datum; Golden Set Hold-out; Codebook nicht in den Role Player. A08 ein Höranker; A12 Ledger an `live_call_id`.
- **Warum Architektur:** Messung und Runtime brauchen eine gemeinsame, **nicht-live** Versionsnadel. Ohne Freeze-ID vergleicht Eval verschiedene Instruction-Stände (Hebel 7) und verschiedene generation-Politiken. Freeze-ID ist kein Prompt-Inhalt und keine DataChannel-Nachricht an das Modell.
- **Risiko:** Freeze-ID oder TB-Codes im Role Player → nächste Runde misst das Codebook (A09 K09-4 Leakage, BLOCKER-Klasse Kernel). Freeze-ID als Marketing-Qualität → 2×-Claim-Tür.
- **Evidenzstufe:** **PLAUSIBEL** als Messpolitik (A09-Protokoll). Produktqualität bleibt **UNBEKANNT**.
- **Nicht:** MOS/Elo/Parität; Golden Set an A07; Freeze-ID als Live-Instruction.

---

### Explizite AVOID (Architektur, neu gegenüber A01-006)

| AVOID | Quelle | Warum neu |
|---|---|---|
| semantic-high als Barge-in-/Heard-Entscheidung | A06 | A01-006 nannte truncate, nicht semantic-high |
| Spoken-Lock via Truncate oder History-Rewrite | A07 + A12 | Lock darf A01-006-Truncate-Verbot nicht aushebeln |
| Goal-Hangup / Examiner in Live-Instructions | A08 + A07 + A09 | Grenze Eval≠Hangup, nicht nur „Evaluator getrennt“ |
| Hume-Fürsorge als State-Ziel | A13 + A14 | Face/Want ≠ Empathie-Match |
| Session-ID als Log-/URL-Klartext ohne Token-Politik | A11 | fehlte in A01-006 |

---

### Was bewusst kein neuer A01-Hebel ist

- A14 Voice State getrennt vom Mundtext — Kernel + A01-005 VoicePort.
- A10 lokale `ops_events` — SRE, nicht State-Besitz.
- A02 Audio-only / kein Avatar — Produkt, nicht Vertragstopologie.
- A06 300 ms / Astra — A01-005/006 schon abgewiesen.
- Provider-Tausch, 2×-Qualität — non-goal.

---

## Phase 4 — K01 Gegenprüfung (unabhängig, nach A-Text)

```text
GEGENPRÜFUNG
Prüfumfang: A-Items gegen A01-006-Negativliste, Kernel-Grenzen, K01-Regeln (Besitzer, Vertrag, Timeout, Fehler, Test; keine widersprüchlichen Zustandsbesitzer; kein blockierender Realtime-Pfad; keine unendlichen Retries). Quellen stichprobenartig gegen die 006-Dateien. Kein Produktlauf. Kein Code.
Durchgeführte Angriffe:
- Item = Umbenennung von A01-006?
- Hangup-Owner als STEAL obwohl A01-005 ihn schon setzt?
- Spoken-Lock rechtfertigt Truncate?
- Vier IDs, ein Besitzer?
- Freeze-ID / Face auf Role-Player-Kanal?
- Examiner als Gate-A-Bau getarnt?
- VERIFIZIERT ohne Messung?
- GO-1/GO-2-Dateien angefasst? (nein, nur dieses Dossier)
```

### BEFUNDE

- **K01-1**
  - Fundstelle: Phase-3 Entwurf Hebel 6, Satz „Hangup = Charakter-state_delta“ als STEAL
  - Schweregrad: MAJOR
  - verletztes Kriterium: „NEUE ADOPT/STEAL/AVOID, die in Schleife 1 bei dir NICHT standen“ + A01-005 Hangup-Owner = State Engine
  - reproduzierbarer Nachweis: `CHG-20260918-005-a01-architektur.md` Zeile Hangup-Owner; A01-006 „Hangup discard-on-interrupt“. Charakter-Hangup ist Restatement, kein Fremd-Steal.
  - minimaler Korrekturvorschlag: Hebel 6 nur Face/Want/Wissensschicht. Goal-Hangup bleibt AVOID. Hangup-Owner nicht neu vergeben.

- **K01-2**
  - Fundstelle: Hebel 4 Spoken-Lock ohne verbindliche Reihenfolge zu Hebel 1
  - Schweregrad: MAJOR
  - verletztes Kriterium: widersprüchliche Zustandsbesitzer; A01-006 Truncate-Verbot
  - reproduzierbarer Nachweis: Zwei Commits (User heard vs Assistant spoken) ohne Sequenz erzeugen Context≠Gehörtes — genau A06 `T_heard_vs_context`. Truncate wäre der naheliegende „Fix“ und ist verboten.
  - minimaler Korrekturvorschlag: Sequenz User-Commit → Assistant-Commit; AVOID Truncate im selben Hebel.

- **K01-3**
  - Fundstelle: Identitätskarte ohne Timeout/Fehler/Test
  - Schweregrad: MAJOR
  - verletztes Kriterium: K01-Freigabe „jeder kritische Pfad: Besitzer, Vertrag, Timeout, Fehlerzustand, Test“
  - reproduzierbarer Nachweis: Tabelle nannte Zweck, nicht Ausfall. Unlock ohne Deadline = unendliches Warten (A04 HEAD + A03 Leitung).
  - minimaler Korrekturvorschlag: Ausfallzeile je ID; alle Timeouts HYPOTHESE; Unlock-Test benennen.

- **K01-4**
  - Fundstelle: Hebel 8 Freeze-ID
  - Schweregrad: MINOR
  - verletztes Kriterium: Role Player sieht keine Rubrik / kein Codebook (Kernel, A09 K09-4)
  - reproduzierbarer Nachweis: Freeze-ID = Modell+Prompt+Datum könnte als Instruction-Präfix landen und das Golden Set leaken.
  - minimaler Korrekturvorschlag: explizit „nie Role-Player-Kanal, nie DataChannel zum Modell“.

- **K01-5**
  - Fundstelle: Hebel 1 `audio_end_ms`
  - Schweregrad: MINOR
  - verletztes Kriterium: bestehende Symbole nicht als Greenfield verkaufen
  - reproduzierbarer Nachweis: `audio_end_ms` in `liveCall.ts` / `live-text.ts` existiert. Vertragslücke ist Besitz, nicht Feld-Erfindung.
  - minimaler Korrekturvorschlag: „Feld existiert; State-Autorität UNBEKANNT“.

- **K01-6**
  - Fundstelle: Hebel 3 Examiner
  - Schweregrad: NOTE
  - verletztes Kriterium: A08 „Nicht in Gate A, solange der 5-Min-Call unglaubwürdig ist“
  - reproduzierbarer Nachweis: A08-006 Satz zu Stufe 1 vs Gate A.
  - minimaler Korrekturvorschlag: Grenze jetzt, Bau DEFER. Kein Textzwang wenn schon so steht.

Cherry-Picking: A12 Cache-Satz als VERIFIZIERT (Vendor-Seite), Figurwirkung HYPOTHESE — zulässig, analog A09 Hume Launch vs RW-Voice-EQ.

Kein Befund zu Provider-Tausch oder 2×-Claim (nicht behauptet).

```text
URTEIL vor Nacharbeit: NACHARBEIT
```

---

## Phase 5 — A Nachbesserung

```text
BEFUND_ID: K01-1
AKZEPTIERT
BEGRÜNDUNG: Hangup-Owner war A01-005. Steal wäre falsch.
ÄNDERUNG: Hebel 6 auf Face/Want/Wissensschicht begrenzt; Goal-Hangup nur AVOID; kein neuer Hangup-Owner.
NACHWEIS: Hebel 6 und AVOID-Tabelle in dieser Datei.
RESTRISIKO: Leser verwechselt Face/Want mit Hangup-Trigger. Bleibt HYPOTHESE bis State-Schema.

BEFUND_ID: K01-2
AKZEPTIERT
BEGRÜNDUNG: Zwei Commits ohne Sequenz rechtfertigen Truncate.
ÄNDERUNG: Sequenz im Hebel 4; AVOID Truncate/Rewrite dort und in der AVOID-Tabelle.
NACHWEIS: Hebel 4 Reihenfolge-Absatz.
RESTRISIKO: 2.1 erzwingt intern Truncate — UNBEKANNT; T_heard_vs_context bleibt nötig.

BEFUND_ID: K01-3
AKZEPTIERT
BEGRÜNDUNG: K01-Freigaberegel gilt auch für Vertragshypothesen.
ÄNDERUNG: Ausfalltabelle unten. Keine erfundenen P95.
NACHWEIS: Abschnitt „Ausfall je Identität“.
RESTRISIKO: Zahlen sind HYPOTHESE, nicht SLA.

BEFUND_ID: K01-4
AKZEPTIERT
BEGRÜNDUNG: Leakage-Klasse Kernel-BLOCKER.
ÄNDERUNG: Hebel 8 Titel und Text „nie Role-Player-Kanal“.
NACHWEIS: Hebel 8.
RESTRISIKO: Freeze-ID in Dateinamen/Logs kann trotzdem Golden-Inhalte verraten — A11/A10.

BEFUND_ID: K01-5
AKZEPTIERT
BEGRÜNDUNG: Symbolcheck hat das Feld gezeigt.
ÄNDERUNG: Hebel 1 Evidenz „Feld existiert; Besitz UNBEKANNT“.
NACHWEIS: Hebel 1.
RESTRISIKO: Lesender Agent patcht liveCall.ts „weil A01 ADOPT“. Deshalb: kein Bau aus dieser Karte.

BEFUND_ID: K01-6
AKZEPTIERT
BEGRÜNDUNG: A08 Gate-A-Grenze.
ÄNDERUNG: Hebel 3 „Nicht: Examiner-Gym in Gate A“.
NACHWEIS: Hebel 3 letzter Spiegelstrich.
RESTRISIKO: keines für diesen Chat.
```

### Ausfall je Identität (Nacharbeit K01-3, alles HYPOTHESE)

| ID | Timeout-Idee | Fehlerzustand | Späterer Test |
|---|---|---|---|
| `session_id` | Token ungültig → kein Media | `unauthorized` / Delete | Replay alter URL ohne Token |
| `call_attempt_id` | ICE/Connect-Deadline | neuer Attempt, alter tot | Zweiter Connect ohne Doppelspur |
| `generation_id` | Unlock-Deadline nach cancel | Force-End, keine neue Generation | Cancel ohne clear ⇒ kein Unlock |
| `sequence_number` | Lücke ≠ still schlucken | Session fail-closed oder mark-gap | Doppel-Event gleiche seq |
| `heard_ms` | EOT ohne audio_end_ms | heard unknown, kein Fake-Commit | T_heard_vs_context (A06) |
| `freeze_id` | fehlt vor Messung | A09 BLOCK der Studie | Report ohne Freeze-ID unzulässig |

Keine P95-Garantie. Kein Retry ohne Bound. Eval darf Unlock/Hangup nicht blockieren.

---

## Phase 6 — K01 Retest

```text
GEGENPRÜFUNG (Retest)
Prüfumfang: nur K01-1…6 und angrenzend Identitäts-Ausfalltabelle. Kein Vollneustart.
Durchgeführte Angriffe: Hangup-Owner-Steal noch da? Spoken-Lock→Truncate-Tür? Freeze auf Player-Kanal? Examiner-Bau? VERIFIZIERT missbraucht?
```

BEFUNDE nach Retest: keine neuen. K01-1 bis K01-6 in den Hebeln 1, 3, 4, 6, 8 und der Ausfalltabelle sichtbar.

```text
URTEIL: FREIGEGEBEN
als AUSTAUSCH-Recherche. Keine Bau-Freigabe. Keine Vertragsänderung im Produkt. Produktqualität UNBEKANNT.
```

---

## Phase 7 — Übergabe

```text
AUFTRAG_ID: CHG-20260919-007-A01
ERGEBNIS: Acht neue Architekturhebel aus Fremd-006, nicht in A01-006. Heard-Quelle audio_end_ms+mhm-Gate; generation_id Unlock-Handshake; call_ended≠call_analyzed; Spoken-Lock ohne Truncate; session_id=Token; Face/Want/Wissensschicht im State; Prefix-Freeze + Mute≠Close; Freeze-ID versiegelt. Hangup-Owner nicht neu vergeben.
GEÄNDERTE_DATEIEN_UND_VERTRÄGE: .cursor/decisions/CHG-20260919-007-a01-architektur.md — keine Produktverträge, kein Code, GO-1/GO-2 unberührt.
NACHWEISE_UND_TESTS: Quellen = 006-Dossiers; Symbolcheck audio_end_ms existiert. Kein Lauf, kein Hörtest.
QUALITÄTSWIRKUNG: UNBEKANNT. Hebel sollen Besitzkonflikte (Heard vs Truncate, Hangup vs Eval, Instruction-Rewrite) verhindern, nicht Realismus behaupten.
KOSTENWIRKUNG: null jetzt. Prefix-Freeze/Close sind A12-Hebel; Mini bleibt Nicht-Floor; kein Providerwechsel.
RISIKEN_UND_OFFENE_HYPOTHESEN: 2.1-internes Truncate UNBEKANNT; audio_end_ms-Besitz UNBEKANNT; Unlock-HEAD nur A04-Bericht; Freeze-ID in Logs; Face/Want-Schema ungeschrieben. Kein 2×-Claim.
GEGENPRÜFER_URTEIL: FREIGEGEBEN (AUSTAUSCH); keine Bau-Freigabe
NÄCHSTE_ROLLE: A00 bündelt Schleife-2. Kein Bau. Falls später GO: genau eine Primärrolle — Vertrag Heard-Quelle/Unlock eher A04+A06 nach A01-Vertragstext; Persistenz call_ended/freeze_id eher A05; Face/Want eher A13 Schema dann A01 Vertrag.
KONTEXT_FÜR_NÄCHSTEN_CHAT: gpt-realtime-2.1 bleibt. Truncate bleibt verboten. Hangup-Owner bleibt State Engine. Eval nach Snapshot nach call_ended. Freeze-ID und TB-Codes nie in den Role Player. Mute≠Close. Semantic-high kein Heard-Gate. GO-1/GO-2 nicht aus dieser Karte öffnen.
```
