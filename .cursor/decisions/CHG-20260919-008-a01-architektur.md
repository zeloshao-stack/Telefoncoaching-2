# CHG-20260919-008 — A01 Architektur (Schleife 3, zweite Austauschrunde)

```yaml
source: a01-systemarchitektur
reviewer: k01-architektur-ausfall
change_id: CHG-20260919-008
loop: 3
status: AUSTAUSCH — kein Code, keine Vertragsänderung im Produkt
date: "2026-09-19"
code: none
go1_go2: unangetastet
provider: gpt-realtime-2.1 WebRTC bleibt
supersedes_partial:
  - "CHG-20260919-007-a01-architektur.md Hebel 2 Unlock-AND"
  - "CHG-20260919-007-a01-architektur.md Hebel 1 Quelle audio_end_ms als Assistant-Heard"
does_not_supersede:
  - "Hangup-Owner = State Engine (005/007)"
  - "Truncate auf WebRTC verboten"
  - "call_ended ≠ call_analyzed"
  - "session_id = Capability-Token"
  - "Freeze-ID nie Role-Player-Kanal"
```

## Change Card (A01-Ausschnitt)

```yaml
change_id: CHG-20260919-008
raw_request: "A01 Systemarchitektur mit K01. CHG-20260919-008 Schleife 3 (ZWEITE AUSTAUSCHRUNDUNG). Lies ALLE 007-Dateien. Finde Widersprüche, Lücken und neue Verträge ZWISCHEN den Rollen. 5–8 NEUE ADOPT/STEAL/AVOID die in 007-A01 NICHT standen. A dann K."
user_outcome: "A00 sieht die Verträge, die erst der 007-Austausch zwischen den Rollen sichtbar gemacht hat — nicht eine Wiederholung von 007-A01."
acceptance_criteria:
  - "5–8 neue ADOPT/STEAL/AVOID, jeweils Fremdrollen + Fund aus 007, Architekturgrund, Risiko, Evidenzstufe"
  - "Kein Item, das in CHG-20260919-007-a01-architektur.md schon stand"
  - "Bekannte Spannungen geprüft: Unlock, Heard, Hangup, Prefix/Cadence, Truncate/Spoken-Lock, IDs"
  - "Pflicht-A/K-Protokoll; GO-1/GO-2 unberührt; kein Provider-Tausch; keine Bau-Freigabe"
non_goals:
  - "Produktcode, Contract-Rewrite, GO-1/GO-2-Patches"
  - "LiveKit/Pipecat/Vapi/Hume/Gemini als Stack"
  - "Billing, Mandant, Studio, Avatare"
  - "Wiederholung der acht 007-A01-Hebel als neu"
primary_owner: A01
reviewer: K01
full_scan_reason: null
```

---

## Phase 1 — A Auftragsverständnis

```text
AUFTRAGSVERSTÄNDNIS
- gewünschte Nutzerwirkung: Reinhard / A00 kann die Widersprüche zwischen den 007-Rollen als Architekturverträge lesen — nicht acht neue Einzelhebel aus 006.
- betroffene Komponente: Verträge ZWISCHEN Rollen (Unlock-Handshake, Heard-Schichten, hangup_act, Instruction-Mutability, Commit-Flächen, Observability-IDs, silence_intent). Nicht Transport-Tuning, nicht Prompttext, nicht UX-Copy.
- Nicht Ziele: Code; GO-1/GO-2; Providerwechsel; 2×-Claim; Bau-Freigabe; 007-A01 wiederholen.
- Annahmen: Quelle der Wahrheit sind die Dateien unter .cursor/decisions/CHG-20260919-007-*.md. 006 nur bei Bedarf zur Abgrenzung. 007-A01 ist die Negativliste.
- Unbekannt: ob HEAD Unlock schon OR oder AND ist (A06-007 berichtet OR in livePlaybackAfterCutAck; kein eigener Lauf). Ob live_call_id heute die Session-URL ist (A10/A05 UNBEKANNT).
- Akzeptanz: 5–8 neue Items mit Fundstelle in 007-Fremd, Architekturgrund, Risiko, Evidenzstufe; K01 unabhängig; kein erfundenes VERIFIZIERT.
```

### Negativliste — stand schon in 007-A01, daher hier verboten als „neu“

Aus `CHG-20260919-007-a01-architektur.md`:

- Heard-Quelle = Client-`audio_end_ms` nach mhm-Gate (als einzelnes Feld)
- `generation_id`-Unlock erst nach `cancelled` **und** `cleared`
- `call_ended` ≠ `call_analyzed`
- Spoken-Lock: emittiertes Assistenten-Audio ist committed
- `session_id` ist Capability-Token
- Face / Want / Wissensschicht sind State-Engine-Felder
- Session-Prefix nach Start einfrieren; Mute ≠ Close
- Freeze-ID versiegeln; nie Role-Player-Kanal
- AVOID semantic-high als Heard-Gate; Spoken-Lock via Truncate; Goal-Hangup / Examiner in Live-Instructions; Hume-Fürsorge als State-Ziel; Session-ID als Log-/URL-Klartext ohne Token-Politik

Hangup-Owner = State Engine bleibt 005/007, wird **nicht** neu vergeben.

---

## Phase 2 — A Impact

```text
IMPACT_PLAN
- Dateien: nur dieses Dossier. Kein Produktcode. GO-1/GO-2 unangetastet.
- Verträge: keine Produktänderung. Ideen für spätere Verträge: Stufe-A/B-Handshake, drei Heard-Objekte, hangup_act-Phasen, Mutability-Matrix, drei Commit-Flächen, Observability-IDs, silence_intent.
- abhängige Rollen (nach BO, nicht jetzt): A04 Stufe A/B + Persist-Heard-Ack; A06 Unlock-Formel + Hangup-Tx; A05 expected_rev + session_ref; A07 Prefix ohne Hangup-Zeile; A13 Spoken-Belief + hangup_act + silence_intent; A10 ops_trace_id; A03 sichtbare drei Enden; A14 Voice-Delta DEFER; A11/A12 Ledger-Join.
- Wiederverwendung: 007-A01 Vier-Schichten, Hangup-Owner, Truncate-Verbot, call_ended≠call_analyzed, session_id=Token, Freeze-ID. Bleiben gültig, werden nicht neu verkauft.
- kleinster Umfang: 7 Hebel + AVOID-Tafel + Ausfall je neuer ID. Kein C4-Rewrite.
- Zieltests: keine in AUSTAUSCH. Jeder Hebel nennt den späteren Nachweis als Hypothese.
- Qualität: UNBEKANNT am Produkt. Kosten: null in dieser Phase.
```

Gelesene 007-Dossiers (vollständig):

| Datei | Rolle |
|---|---|
| `CHG-20260919-007-a01-architektur.md` | A01 (Negativliste) |
| `CHG-20260919-007-a02-produkt.md` | A02 |
| `CHG-20260919-007-a03-ux.md` | A03 |
| `CHG-20260919-007-a04-webrtc.md` | A04 |
| `CHG-20260919-007-a05-daten.md` | A05 |
| `CHG-20260919-007-a06-transport.md` | A06 |
| `CHG-20260919-007-a07-prompts.md` | A07 |
| `CHG-20260919-007-a08-drills.md` | A08 |
| `CHG-20260919-007-a09-messung.md` | A09 |
| `CHG-20260919-007-a10-ops.md` | A10 |
| `CHG-20260919-007-a11-privacy.md` | A11 |
| `CHG-20260919-007-a12-kosten.md` | A12 |
| `CHG-20260919-007-a13-figur.md` | A13 |
| `CHG-20260919-007-a14-stimme.md` | A14 |

Kein Repository-Vollscan. 006 nur zur Abgrenzung der Negativliste, nicht als neue Quelle. GO-1/GO-2-Dateien nicht geöffnet zum Patchen.

---

## Phase 3 — A Ergebnis: sieben neue Verträge

Jeder Hebel ist **neu gegenüber 007-A01**. Er entsteht aus einem Widerspruch **zwischen** 007-Rollen, nicht aus einem einzelnen 006-Steal. Evidenz höchstens so hoch wie die 007-Fremdquelle plus Architekturfolge. Nichts am Produkt gemessen in diesem Chat.

### Spannungskarte (warum 007-A01 nicht reicht)

| Spannung | 007-A01 sagte | 007-Fremd danach | Lücke |
|---|---|---|---|
| Unlock | `cancelled` **und** `cleared` | A04 Stufe A = Mute+Uhr, kein Event; A06 Unlock = `speech_stopped` ∧ (`cancel` ∨ `clear`) ∧ kein Restton; naives AND = Deadlock (K06-1) | Eine Formel für zwei Stufen; AND vs OR |
| Heard | Quelle = Client-`audio_end_ms` | A04 HEAD: `audio_end_ms` kommt aus **Nutzer**-`speech_stopped`; keine Assistant-Playback-Uhr. A13 Spoken-Belief grob. A05 `heard_ms` = Optimistic-Lock | Ein Feld, drei Bedeutungen; Quelle ist User-EOT |
| Hangup | Owner = State Engine; discard | A13 `hangup_act` vier Phasen; A06 Playback-Tx; A04 `playout_complete`; A03 sichtbares Ende = Gehörtes, nicht Tool | Owner ohne Phasenmaschine |
| Prefix | einfrieren; Mute ≠ Close | A07 Cadence-2 = Vollreplace; Hangup-Policy muss Prefix **verlassen**. A06 H8 erlaubt Hangup-Arming als einzige Mid-Call-Mutation. A14 will Voice-Delta an der Zuggrenze | Total-Freeze vs nötige Arming vs Stimme |
| Spoken-Lock | committed, kein Truncate | A04 Persist = Heard-Ack, nicht Item-Final. A13 Glaube ≠ Wortlaut. A12 Truncate spart nichts | Ein Commit, drei Flächen |
| IDs | `session_id` = Token | A10 `ops_trace_id` minten; `live_call_id` verboten in `ops_events`. A05 `session_ref` = SHA-256. A12 Ledger je `live_call_id`. A11 kein Export-Join | Drei Join-Schlüssel ohne Schicht |

---

### 1. ADOPT — Zweistufiges Barge; Unlock nur Stufe B; 007-A01-AND aufgehoben

- **Fremdrollen + Fund:** A04-007 H2: Stufe A = Mute + Playback-Uhr einfrieren, **kein** cancel, **kein** clear, Resume derselben `generation_id`. Stufe B = Cut + cancel + clear. A06-007 H3 / K06-1: Unlock = `speech_stopped` nach Cut **und** (`cancelled` **oder** `cleared`) **und** kein Restton. Clear ist Ohr-Pflicht. Naives AND totet den Call, wenn Cancel mit `isBenignLiveCancelError` stirbt. A03-007 Idee 3: mhm ändert den Status nicht (`{Name} spricht.` bleibt).
- **Warum neu gegenüber 007-A01:** Hebel 2 dort war ein **einziges** Unlock-AND für jede Unterbrechung. Das kollidiert mit Stufe A (kein Event zum Ack) und mit A06-OR+Watchdog. Ohne Stufenvertrag baut der nächste Chat cancel/clear in `speech_started` **und** verlangt AND — Resume unmöglich, Leitung stumm.
- **Vertrag:**

| Stufe | Auslöser | Client | Provider | `generation_id` | Unlock |
|---|---|---|---|---|---|
| A lokal, reversibel | mhm / Noise unter A06-Schwelle | Mute + Uhr pausieren | kein cancel, kein clear | dieselbe | **kein** Unlock-Ereignis; Unmute = Resume |
| B irreversibel | echtes Barge-in (A06-Gate) | Cut + cancel + clear | Ack | tot; nächste Generation neu | `speech_stopped` ∧ (`cancelled` ∨ `cleared`) ∧ kein Restton; Clear = Ohr; Watchdog wenn Clear ausbleibt |

- **SUPERSEDES:** 007-A01 Hebel 2 (`cancelled` ∧ `cleared`). AND gilt nicht mehr.
- **Risiko:** Schwelle fehlt → HEAD bleibt Stufe B für jedes `speech_started` (A04-007). Watchdog ohne Bound = stilles Hängen (A03 Leitung). Stufe A plus Clear = nichts zum Fortsetzen (K04-1).
- **Evidenzstufe:** **PLAUSIBEL** (A04-Tabelle + A06-Formel + K06-1 HEAD-OR). Am Produkt in diesem Chat nicht reproduziert.
- **Timeout/Fehler (HYPOTHESE):** Unlock-Deadline nur Stufe B; Timeout → sichtbarer Force-End, keine neue Generation. Stufe A hat keine Unlock-Deadline.
- **Nicht:** GO-2 patchen; zweite VAD; `track.stop()` im Barge-in; semantic-high als Stufentrenner.
- **Späterer Nachweis:** Cancel ohne Clear darf Unlock **mit** Watchdog+Reststille setzen; Stufe A darf keine Interrupt-Events senden; mhm lässt UX auf `speaking`.

---

### 2. ADOPT — Drei Heard-Objekte, eine Schreibreihenfolge

- **Fremdrollen + Fund:** A04-007 H3 HEAD: `audio_end_ms` wird aus `input_audio_buffer.speech_stopped` gelesen — das ist **Nutzerende**, keine Assistant-Playback-Uhr. `HTMLMediaElement.currentTime` auf WebRTC-Remote ist als Heard-Quelle **verboten** bis Chrome+Safari-Messung. Uhr = AudioContext/Sample, Stufe HYPOTHESE. A06-007 H1: Fläche 1 = Client-Cut, nie Truncate als Heard-Beweis. A05-007 I2: `heard_ms` + `heard_text_hash` + `expected_rev` als Optimistic-Lock, getrennt von `turns.seq`. A13-007 I1: Spoken-Belief ist **grob** (Anfang, Kern, Abbruch), nicht Millisekunden-Zitat. A09-007 M8/M9: `T_heard` = \|heard_ms − playback_cursor\|; M9 = Kontextmenge, nicht dieselbe Uhr. A12-007 I-7: Gehört ist Kosten- **und** Qualitäts-Einheit.
- **Warum neu gegenüber 007-A01:** Hebel 1 setzte die **Quelle** auf Client-`audio_end_ms` nach mhm-Gate. Nach A04-007 ist dieses Symbol der User-EOT-Stempel, nicht das Assistant-Gehörte. Ein Feld kann nicht gleichzeitig User-EOT, State-Lock und Figuren-Gedächtnis sein.
- **Vertrag (drei Objekte, ein Fluss):**

| Objekt | Besitzer | Was es ist | Was es nicht ist |
|---|---|---|---|
| `playout_ms` | A06+A04 Transport | Assistant-Playback-Cursor der `generation_id` (AudioContext/Sample) | User-`speech_stopped`; `currentTime`; Provider-Truncate |
| `heard_ms` / `heard_text_hash` | State Engine (A01+A05) | autoritativer Commit + Optimistic-Lock (`expected_rev`, `heard_ms >= last`) | Turn-Seq; Role-Player-Text; User-EOT |
| `spoken_belief` | A13, **abgeleitet** | grober Glaube der Figur über den eigenen Satz | Wortlaut, ms, LLM-Schreibzugriff |

Schreibreihenfolge: `playout_ms` (Transport) → State-Commit `heard_*` (Engine validiert) → `spoken_belief` **abgeleitet** aus dem Commit, nie vom Role Player vorgeschlagen, nie exakter als Anfang/Kern/Abbruch.

User-EOT bleibt ein **anderes** Ereignis: `speech_stopped` darf `playout_ms` nicht setzen. mhm-Gate klassifiziert User-EOT vs Barge, nicht Assistant-Heard.

- **SUPERSEDES teilweise:** 007-A01 Hebel 1 „Quelle = `audio_end_ms`“ als Assistant-Heard. Das Symbol bleibt User-EOT-Kandidat; Assistant-Heard braucht `playout_ms`.
- **Risiko:** Drei Besitzer ohne Fluss → Context ≠ Gehörtes (A06 `T_heard_vs_context`, A09 CTX-UNHEARD). Belief als Prompt-Zitat → Buchfigur (K13-4). `currentTime` als Uhr → Märchen-Heard (K04-3).
- **Evidenzstufe:** HEAD-Lesart `audio_end_ms` ← `speech_stopped` **PLAUSIBEL** (A04-007). Assistant-Uhr **HYPOTHESE**. State-Besitz **UNBEKANNT**.
- **Timeout/Fehler (HYPOTHESE):** EOT ohne `playout_ms` → `heard unknown`, kein Fake-Commit. Doppel-Ack gleicher Cursor = No-Op (A05 Idempotenz).
- **Nicht:** `conversation.item.truncate`; Word-Timing (A05 DEFER); Belief im Mundtext.
- **Späterer Nachweis:** A09 M8 `instrument_missing` wenn `playout_ms` fehlt; M9 erst nach State-`heard_*`.

---

### 3. ADOPT — `hangup_act` Vierphasen; sichtbares Ende = Heard, nicht Tool-Return

- **Fremdrollen + Fund:** A13-007 I2: Auflegen ist Charakterwahl, dann letzter Satz, dann Wegsein; sozial vollzogen erst wenn sie den Satz **selbst gehört** hat; Akt = Absicht + Glaube, keine neue Schlusszeile (K13-3). A06-007 H2: `end_call` startet Playback-Tx; natürliches `output_audio_buffer.stopped` → committed; Barge/Clear → Discard; `last_line` aus Tool-Args ≠ Heard; 8-s-Grace = Watchdog. A04-007 H4: `playout_complete(generation_id)` \| `barge_discard(generation_id)` \| Watchdog. A03-007 Idee 6: Force-End unsichtbar; Schlusssatz gehört ⇒ Figur-Ende, auch wenn das Werkzeug ausbleibt; kein viertes „System legt auf“. A07-007 N3: Hangup-Policy und Closing Line **verlassen** das Prefix.
- **Warum neu gegenüber 007-A01:** 007-A01 hat den Owner **nicht** neu vergeben und `call_ended` ≠ `call_analyzed` gesetzt. Neu ist die **Phasenmaschine** und die UX-Regel „Gehörtes schlägt Tool“. Ohne Phasen schreiben A04 `ended` auf Grace, A06 auf `last_line`, A03 auf Force-End-Fail = Drop — drei Enden, drei Uhren.
- **Vertrag:** Hangup-Owner bleibt **State Engine**. A13 besitzt Absicht und Glauben, nicht die Zeile. A06 besitzt die Tx. A04 besitzt Playout-Ack. A03 besitzt die drei sichtbaren Enden.

```text
gewählt     State Engine autorisiert Charakter-Ende (A13-Absicht als validierter Delta)
    │
gesprochen  Hangup-Playback-Tx läuft; generation_id des Schlusssatzes; Prefix unverändert
    │
    ├── gehört     Heard-Ack dieser generation_id → call_ended + ended_reason=character_hangup
    └── verworfen  Stufe-B-Barge / Clear → Discard; ungespielte Wörter nicht in State;
                   last_line kein Ersatz-Heard; Weg-Intention darf bleiben oder kippen (A13)
```

Sichtbare Abbildung (A03, bindend für den Vertrag):

| Phase-Ergebnis | Sichtbares Ende |
|---|---|
| Nutzer legt auf | Nutzer |
| `gehört` (Schlusssatz) | Figur — auch wenn Force-End/Tool ausbleibt |
| `verworfen` + kein Schlusssatz + Leitung tot | Drop |
| Force-End intern | unsichtbar; kein viertes Ende |

Eval / Examiner erst nach `call_ended` **und** nicht nach Drop (A08-007 Pflicht-Schleife, A03-007 Idee 4). Das ist **kein** neues `call_ended` ≠ `call_analyzed` — nur das Drop-Tor.

- **Risiko:** Phasen als zweiter Hangup-Owner gelesen → 007-K01-1 wiederholt. Schluss-Skript im Prefix → Cadence-Replace (Hebel 4). Persist wartet auf Item-Final statt Heard → Mic offen (K04-4).
- **Evidenzstufe:** **PLAUSIBEL** als Vertrag aus vier 007-Dossiers. Ohr UNBEKANNT.
- **Timeout/Fehler (HYPOTHESE):** Watchdog ersetzt Grace-als-Semantik; nach Timeout: wenn `playout_ms` > 0 für den Schlusssatz → `gehört` / Figur-Ende; sonst Drop. Kein Eval-Wait.
- **Nicht:** Goal-Hangup; Hangup-Owner neu vergeben; Examiner nach Drop; `last_line` persistieren.
- **Späterer Nachweis:** Interrupt während Tx ⇒ kein `heard_text` aus Tool-Args; Force-End-Fail nach gehörtem Satz ⇒ nicht Drop.

---

### 4. ADOPT — Instruction-Mutability-Matrix (nicht Total-Freeze, nicht Cadence-2)

- **Fremdrollen + Fund:** A07-007 Idee 7 + N3: nach `session.create` bleiben Instructions und Tools konstant; Cadence-2 (`LIVE_INSTRUCTIONS_CADENCE = 2`) ist geplanter Cache-Bruch; Hangup-Neigung und Affect **ändern den Prefix nicht**; Hangup-Policy / Closing Line gehören der State Engine. A12-007 I-2: Cadence-/Anti-Hilfe-`session.update` = Cache-Tod, nicht Feintuning. A06-007 H8: `session.update` während Play oder Hangup-Tx ist Fläche 3; Queue bis Play-Idle; **Hangup-Arming als einzige erlaubte Mid-Call-Mutation** — Widerspruch zu A07-N3. A14-007 Idee 7: Prefix = Stimmlage/Register/Identität; Voice-State-**Delta** an der Zuggrenze (nicht die ganze Delivery einfrieren). A06-007 H4 / A07-007 N2: VoicePort auf 2.1 **HYPOTHESE / DEFER**; Mid-Call-`session.update` der STIMME-Zeile = Vollreplace.
- **Warum neu gegenüber 007-A01:** Hebel 7 verbot **jede** inkrementelle Instruction-Änderung. Das lässt A06-Arming und A14-Delta ohne legalen Kanal — oder zwingt sie zurück in Cadence-2. Neu ist die **Matrix**, die den Widerspruch A06-H8 vs A07-N3 vs A14-Delta entscheidet.
- **Vertrag:**

| Was | Wann | Wie | Nicht |
|---|---|---|---|
| Persona, Tools, Stimme-ID, gelebter Face/Want-Satz (ohne Köpfe) | nach `session.create` | eingefroren | Cadence-2-Vollreplace; `FACE:`/`WANT:`/`STIMME:`-Köpfe (A07 N1) |
| Hangup-Arming | wenn State Engine `gewählt` setzt | Tool / Abbruch **außerhalb** des Prefix; kein `session.update` der Persona | „LEG JETZT AUF“-Zeile im Kern; Anti-Hilfe-Rewrite |
| Voice-State-Delta | Gate A | **keine** Mid-Call-Mutation; Register bleibt Prefix | `session.update` als Stimme; Cadence-2 |
| VoicePort-Sidecar | nach Vertrag A01+A14 | DEFER; nur Play-Idle, nie Vollreplace | Hangup-Tx während Play |

Entscheidung A06-H8 vs A07-N3: Hangup-Arming **ja**, Prefix-Mutation **nein**. Arming ist State+Tool, nicht Instruction-Flush.

- **Risiko:** „Delta an Play-Idle“ wird als `session.update` gebaut → Cache-Tod + Stimmbruch (A12, A14). Hangup im Prefix belassen → Freeze lügt. Affect wieder in Instructions → N2 verletzt.
- **Evidenzstufe:** Cadence-2 und STIMME-im-Prefix **PLAUSIBEL** als Ist (A07/A14 Fundstellen). VoicePort **HYPOTHESE**. Cache-Bruch bei Instruction-Edit **VERIFIZIERT** als Vendor-Aussage (007-A01/A12, nicht neu gemessen).
- **Nicht:** Mini-Floor; Providerwechsel; GO-1-Reopen; Delivery komplett einfrieren (K14-3 Monotonie — gilt erst wenn VoicePort existiert).
- **Späterer Nachweis:** Prefix-Hash konstant über n Turns (A07 Isolationstest); `cache_bust` an `generation_id` (A10-007 S2-7) wenn jemand trotzdem replaced.

---

### 5. ADOPT — Drei Commit-Flächen: Persist ≠ Context-Lock ≠ Belief

- **Fremdrollen + Fund:** A04-007 H6 / K04-4: Persist-Schwelle = **Heard-Ack**, nicht Provider-`conversation.item` final. Heard ohne Provider-Commit ist erlaubt. Commit ohne Heard ist zu viel. Dedup `(generation_id, text)`. A13-007 I1/I8: Glaube grob; Truncate löscht Ton, nicht Glauben; kein Stack-Tutorial. A07-007 Spoken-Lock bleibt Prompt/Isolation, nicht VAD (A06-007 H7). A12-007 I-1: Truncate ist **keine** Ersparnis; Cancel vor weiterem Output kürzt die Zeile. A09-007 M11: Spoken-Lock **beobachtbar** am Output (LOCK-REGIE), nicht als Prompt-Nie.
- **Warum neu gegenüber 007-A01:** Hebel 4 setzte Spoken-Lock als Assistant-Commit und verbot Truncate. Neu ist die **Trennung der drei Flächen**, die 007-A04 und 007-A13 erst sichtbar gemacht haben. Ein Lock, das Persist auf Item-Final warten lässt, hält das Mic offen (K04-4). Ein Lock, das `heard_text` in den Player schreibt, erzeugt die Buchfigur (K13-4).
- **Vertrag:**

| Fläche | Commit-Regel | Darf Truncate? | Darf den Player sehen? |
|---|---|---|---|
| Persist / Eval-Snapshot | Heard-Ack der `generation_id` (A04) | nein | nein (Daten, nicht Prompt) |
| Context-Lock | emittiertes Audio dieser Generation bleibt im Context; kein History-Rewrite | nein | Context ja, als Gespräch, nicht als Regie |
| Spoken-Belief | grob aus State-`heard_*` abgeleitet (Hebel 2) | n/a | nur als Lage, nie als Zitat-ms |

User-Commit bleibt Hebel-2-Fluss (`playout` betrifft Assistant; User-EOT ist separat). Reihenfolge unverändert: User-Gehörtes und Assistant-Gehörtes sind zwei Commits; Truncate beweist keines.

- **Risiko:** Drei Flächen ohne Dedup → doppelte `/live/turns`. Truncate als „Lock-Fix“ — 006/007-Verbot. Persist auf Item-Final → last_line verloren oder Mic offen.
- **Evidenzstufe:** **PLAUSIBEL** (K04-4, K13-4, A12 Truncate≠Ersparnis). Wirkung auf 2.1 **HYPOTHESE**.
- **Nicht:** Spoken-Lock via `conversation.item.truncate`; Mid-Call-Vollreplace als Lock; Nie-Liste „sag nichts zweimal“.
- **Späterer Nachweis:** Barge Stufe B → kein Persist des Ungesagten; gehörter Schlusssatz persistiert auch ohne Item-Final.

---

### 6. ADOPT — Observability-IDs: `ops_trace_id` ≠ `session_ref` ≠ `live_call_id`

- **Fremdrollen + Fund:** A10-007 S2-1/S2-2 / K10-2: bei Connect ein **gemintetes** `ops_trace_id` (nicht `hash(session_id)` als öffentlicher Log-Wert — der Hash bleibt Identifikator). `ops_events` speichern **keine** `session_id` und keine `live_call_id`, sofern diese das Token sein können. A05-007 I1/I4: `live_call_id` ist Provider-Korrelation, **nicht** unser Token; Usage join über `session_ref = SHA-256(session.id)` plus `live_call_id` plus `freeze_id`; Token nicht im Ledger-Klartext. A12-007 I-4: Close-Beweis lokal, Observability nicht kaufen. A11-007 G-007-3: Ledger-Schlüssel darf kein exportierbarer Join Transkript↔Euro sein.
- **Warum neu gegenüber 007-A01:** Die Identitätskarte dort hatte `session_id`, `call_attempt_id`, `generation_id`, `sequence_number`, `heard_ms`, `freeze_id`. A10 wurde bewusst **kein** Hebel („SRE, nicht State-Besitz“). Nach 007 widersprechen A10, A05, A12 und A11 einander, **welcher** Schlüssel in welcher Datei stehen darf. Das ist ein Architektur-Join, kein Log-Format.
- **Vertrag (Erweiterung, nicht Ersatz der 007-Karte):**

| ID | Besitzer | Zweck | Darf in Logs / usage / ops? | Nicht |
|---|---|---|---|---|
| `session_id` | A05+A11 | Capability-Token, Authz, Löschung | nein Klartext | Anzeige, Log-Schlüssel, Ledger-PK |
| `ops_trace_id` | A10 | Support-Korrelat, gemintet | ja | aus Session-ID ableiten und öffentlich loggen |
| `session_ref` | A05 | SHA-256 für Usage/Ops-Join nach Token-Löschung | ja (Hash) | als Bearer behandeln; als öffentlicher Lookup ohne Auth |
| `live_call_id` | Provider / A05 | Anbieter-Korrelation | nicht in `ops_events`; höchstens in löschbarer Operator-Map | Zugriffs-Token; Export-Join auf Transkript |
| `generation_id` | A04+State | eine Assistenten-Äußerung | ja (kein Mundtext) | Event-Reihenfolge, Session-Ersatz |
| `start_attempt_id` | A04→A05 | Start-Idempotenz | ja kurz | Bearer, URL |

007-IDs `sequence_number`, `heard_ms`, `freeze_id` bleiben wie 007-A01. `call_attempt_id` (WebRTC-Connect) ≠ `start_attempt_id` (Insert-Idempotenz) — zwei Lebensdauern, nicht zusammenlegen.

- **Risiko:** `live_call_id` == Session-URL (UNBEKANNT) → Token in der Kostenzeile (K10-2). Hash(session) als Log-Wert → dauerhafter Identifikator (A10 AVOID). Usage+Turns exportiert = Transkript↔Euro (A11).
- **Evidenzstufe:** **PLAUSIBEL** als Governance/Persistenz aus 007-A10/A05/A11. Ob HEAD `live_call_id` das Token ist: **UNBEKANNT**.
- **Timeout/Fehler:** siehe Ausfalltabelle unten.
- **Nicht:** Datadog/LiveKit als Wahrheit; zweites Event-Log; Mandant; Token rotieren.
- **Späterer Nachweis:** Replay alter URL ohne Token → 404; Log-Stichprobe ohne `session_id`; Usage-Zeile ohne Klartext-Token.

---

### 7. STEAL — `silence_intent` ist State, nicht VAD und nicht Prompt

- **Fremdrollen + Fund:** A13-007 I3: dieselbe Pause ist (1) **besetzt** — Wortsuche, Face halten; (2) **abgetreten** — sie wartet auf ihn; (3) **zurückgezogen** — innerlich weg. A13 liefert nur das Feld; kein VAD-Satz, kein Player-Verbot (K13-1). A06-007 H5: Repair-Hold = `create_response` aus, Mic+Session offen; nicht `silence_duration_ms` / `idle_timeout_ms` strecken. A14-007 Idee 3: Hold vs Yield sitzt in der Kontur, nicht in der Pausenlänge; A14 liefert Hörabsicht, A06 misst `T_eot`. A03-007 Idee 3: mhm ändert Status nicht. A07-007 Idee 8: Repair ohne Hallo?-Skript.
- **Warum neu gegenüber 007-A01:** Hebel 6 war Face/Want/Wissensschicht (stehende Person). `silence_intent` ist ein **Turn-Gate pro Pause**. Ohne Feld flacht A06 jede Stille zu User-EOT oder Barge, A14 jede Pause zu `hesitant`, A07 jede Lücke zu „Hallo?“.
- **Vertrag:** State Engine besitzt `silence_intent`: `hold_floor` \| `yield` \| `withdrawn`. Role Player sieht den validierten Stand, nicht eine Regel „bei Repair schweigen“. A06 liest das Tor (`create_response` an/aus), kalibriert nicht die VAD-Zahl. A14 mappt Kontur, ändert das Feld nicht. A03 ändert Copy nur bei `yield` nach echtem User-EOT, nie bei mhm.

```text
silence_intent=hold_floor  → A06 Repair-Hold; A14 nicht-final; A03 bleibt „{Name} spricht.“
silence_intent=yield       → A06 darf EOT nach mhm-Gate; A14 Fallkontur
silence_intent=withdrawn   → kein Repair-Hold; Hangup-Pfad nur wenn State Engine `gewählt` setzt
```

- **Risiko:** Feld als Player-Nie-Liste (K13-1). Globale `silence_duration_ms` als Implementierung (K06-3). Want=weg plus Hold = Figur klebt (A14 Idee 1).
- **Evidenzstufe:** **HYPOTHESE** (A13 I3; Transport ungebaut; `wait_for_user` ≠ Repair-Hold).
- **Timeout/Fehler (HYPOTHESE):** Hold ohne Bound → Geisterminute (A12). Bound ist Session-Idle-Watchdog, nicht VAD-Streckung; Timeout → `yield` oder sichtbares Drop, kein stilles Close.
- **Nicht:** fünftes `pause_profile`; semantic-high als Verstehen der Pause; Isolation als Lernziel; Face/Want hier neu verkaufen.
- **Späterer Nachweis:** T_eot während `hold_floor`+mhm darf nicht steigen; Hallo? nicht nach Überlappung (A14 Ein-Schlitz-Regel).

---

### Explizite AVOID (Architektur, neu gegenüber 007-A01)

| AVOID | Quelle 007 | Warum neu |
|---|---|---|
| Unlock = `cancelled` ∧ `cleared` ohne Stufe / ohne Watchdog | A06 K06-1, A04 H2 | 007-A01 Hebel 2 **war** genau dieses AND |
| `audio_end_ms` aus User-`speech_stopped` als Assistant-Heard | A04 H3 | 007-A01 Hebel 1 benutzte das Symbol als Quelle |
| `HTMLMediaElement.currentTime` als Heard-Uhr | A04 K04-3 | fehlte in 007-A01 |
| Hangup-Policy / Closing Line im gefrorenen Prefix | A07 N3 vs A06 H8 | 007-A01 Freeze ohne Arming-Kanal |
| Cadence-2-`session.update` als Stimme oder Anti-Hilfe | A07, A12 I-2, A14 Idee 7 | konkreter Täter, nicht nur „kein Vollreplace“ |
| `last_line` / Tool-Args als Heard oder Persist | A06 H2, A04 H6 | 007-A01 discard ohne Persist-Schwelle |
| `live_call_id` oder `session_id` in `ops_events`; `hash(session_id)` als öffentlicher Log-Join | A10 K10-2, A11 G-007-3 | 007-A01 Identitätskarte ohne Ops-Schicht |
| Examiner / Auswertung nach Drop | A03 Idee 4, A08 Pflicht-Schleife | 007-A01 hatte call_ended≠analyzed, nicht das Drop-Tor |
| Sichtbares viertes Ende „System legt auf“ | A03 Idee 6 | Force-End war in 007-A01 kein UX-Vertrag |

---

### Was bewusst kein neuer A01-Hebel ist

- Face/Want/Wissensschicht — 007-A01 Hebel 6.
- Mute ≠ Close — 007-A01 Hebel 7.
- Freeze-ID / Codebook nie Role Player — 007-A01 Hebel 8.
- `call_ended` ≠ `call_analyzed` als solche — 007-A01 Hebel 3; hier nur Drop-Tor.
- A14 Voice State getrennt vom Mundtext — Kernel + 005 VoicePort.
- A02 Audio-only / kein Avatar — Produkt.
- A06 300 ms / semantic-high — schon AVOID.
- Provider-Tausch, 2×-Qualität — non-goal.
- Examiner-Gym in Gate A — A08/A02 DEFER.

---

## Phase 4 — K01 Gegenprüfung (unabhängig, nach A-Text)

```text
GEGENPRÜFUNG
Prüfumfang: A-Items gegen 007-A01-Negativliste, Kernel-Grenzen, K01-Regeln (Besitzer, Vertrag, Timeout, Fehler, Test; keine widersprüchlichen Zustandsbesitzer; kein blockierender Realtime-Pfad; keine unendlichen Retries). Quellen stichprobenartig gegen die 007-Dateien. Kein Produktlauf. Kein Code.
Durchgeführte Angriffe:
- Item = Umbenennung eines 007-A01-Hebels?
- Unlock-AND und Unlock-OR gleichzeitig gültig?
- Drei Heard-Objekte, drei Schreiber?
- hangup_act vergibt den Owner neu (007-K01-1)?
- Voice-Delta ohne VoicePort = session.update?
- Neun IDs ohne Ausfall?
- Persist≠Lock = Spoken-Lock-Restatement?
- silence_intent = VAD-Anweisung oder Face/Want-Kopie?
- VERIFIZIERT ohne Messung?
- GO-1/GO-2-Dateien angefasst? (nein, nur dieses Dossier)
```

### BEFUNDE

- **K01-1**
  - Fundstelle: Erstentwurf Hebel 1 ohne verbindliches SUPERSEDES
  - Schweregrad: **MAJOR**
  - verletztes Kriterium: ein kritischer Pfad, ein Vertrag; 007-A01 Hebel 2 bleibt sonst parallel gültig
  - reproduzierbarer Nachweis: `CHG-20260919-007-a01-architektur.md` Hebel 2 „Unlock erst nach cancelled **und** cleared“. A06-007 K06-1: naives AND Deadlock. Zwei A01-Dokumente, zwei Formeln.
  - minimaler Korrekturvorschlag: YAML `supersedes_partial` + Satz „AND gilt nicht mehr“ im Hebel.

- **K01-2**
  - Fundstelle: Erstentwurf Hebel 2 drei Objekte ohne Schreibreihenfolge
  - Schweregrad: **MAJOR**
  - verletztes Kriterium: widersprüchliche Zustandsbesitzer; A01-006 Truncate-Verbot als naheliegender „Fix“
  - reproduzierbarer Nachweis: A04-007 HEAD `audio_end_ms` ← User-`speech_stopped`; A13-007 I1 Belief; A05-007 I2 Lock. Drei Schreiber ohne Fluss = Context≠Gehörtes (A09 M9 CTX-UNHEARD).
  - minimaler Korrekturvorschlag: Transport → State-Commit → Belief **abgeleitet**. User-EOT explizit getrennt. 007-A01 Hebel 1 Quelle teilweise aufheben.

- **K01-3**
  - Fundstelle: Erstentwurf Hebel 3 Überschrift konnte als neuer Hangup-Owner gelesen werden
  - Schweregrad: **MAJOR**
  - verletztes Kriterium: 007-A01 K01-1; Hangup-Owner = State Engine seit 005
  - reproduzierbarer Nachweis: A13-007 I2 „A13 besitzt Absicht und Glauben, nicht die Zeile“ ist Phaseninhalt, nicht Owner-Steal. Ein STEAL „Hangup-Akt“ ohne Owner-Satz wiederholt 007-K01-1.
  - minimaler Korrekturvorschlag: Owner-Satz zuerst; Phasen nur darunter; A13 nicht als Owner.

- **K01-4**
  - Fundstelle: Erstentwurf Hebel 4 „Voice-Delta an Play-Idle“
  - Schweregrad: **MAJOR**
  - verletztes Kriterium: A07-007 N2 / A06-007 H4 — VoicePort unbelegt; `session.update` = Vollreplace + Cache-Tod
  - reproduzierbarer Nachweis: A14-007 Idee 7 will Delta; A07 N2 Gate A = eingefrorenes Register. Ohne DEFER ist die Matrix ein Cadence-2 unter neuem Namen.
  - minimaler Korrekturvorschlag: Gate A keine Mid-Call-Voice-Mutation; VoicePort DEFER; Hangup-Arming = State+Tool, nicht Instruction.

- **K01-5**
  - Fundstelle: Hebel 6 neue IDs ohne Ausfallzeile
  - Schweregrad: **MAJOR**
  - verletztes Kriterium: K01-Freigabe „jeder kritische Pfad: Besitzer, Vertrag, Timeout, Fehlerzustand, Test“
  - reproduzierbarer Nachweis: 007-A01 K01-3 dieselbe Lücke an der ersten Identitätskarte.
  - minimaler Korrekturvorschlag: Ausfalltabelle für `ops_trace_id`, `session_ref`, `live_call_id`, `start_attempt_id`, `playout_ms`, `hangup_act`, `silence_intent`. Zahlen HYPOTHESE.

- **K01-6**
  - Fundstelle: Hebel 5 vs 007-A01 Hebel 4 Spoken-Lock
  - Schweregrad: **MINOR**
  - verletztes Kriterium: nur Neue
  - reproduzierbarer Nachweis: Spoken-Lock + Truncate-AVOID stand in 007-A01. Neu ist nur Persist=Heard-Ack (A04 K04-4) und Belief≠Wortlaut (A13).
  - minimaler Korrekturvorschlag: Delta-Satz Pflicht; Tabelle Persist / Context / Belief. **Übernommen.**

- **K01-7**
  - Fundstelle: Hebel 7 `silence_intent`
  - Schweregrad: **MINOR**
  - verletztes Kriterium: A13 besitzt Wahrheit, nicht Transport; 007-A01 Hebel 6 nicht als Kopie
  - reproduzierbarer Nachweis: K13-1 — Psych-Satz an VAD wird Nie-Liste. Face/Want sind stehende Felder; silence_intent ist Pause-Gate. Hold ohne Bound = Geistersession (A12).
  - minimaler Korrekturvorschlag: kein VAD-Text; Bound als Idle-Watchdog; Abgrenzung zu Face/Want.

Cherry-Picking: Vendor-Cache-Satz als VERIFIZIERT (Aussage), Figurwirkung HYPOTHESE — zulässig wie 007-A01. Kein Provider-Tausch, kein 2×-Claim.

```text
URTEIL vor Nacharbeit: NACHARBEIT
```

---

## Phase 5 — A Nachbesserung

```text
BEFUND_ID: K01-1
AKZEPTIERT
BEGRÜNDUNG: Zwei Unlock-Formeln sind ein Single-Point-of-Confusion.
ÄNDERUNG: YAML supersedes_partial; Hebel 1 Satz „AND gilt nicht mehr“; Tabelle Stufe A ohne Unlock-Ereignis.
NACHWEIS: Hebel 1 und Dateikopf.
RESTRISIKO: Leser zitiert weiter 007-A01 Hebel 2. 008 sticht für Unlock.

BEFUND_ID: K01-2
AKZEPTIERT
BEGRÜNDUNG: Quelle audio_end_ms als Assistant-Heard ist nach A04-007 falsch.
ÄNDERUNG: drei Objekte + Schreibreihenfolge; User-EOT getrennt; 007-A01 Hebel 1 teilweise aufgehoben.
NACHWEIS: Hebel 2.
RESTRISIKO: playout_ms ungebaut; T_heard bleibt instrument_missing.

BEFUND_ID: K01-3
AKZEPTIERT
BEGRÜNDUNG: Owner-Steal war 007 schon MAJOR.
ÄNDERUNG: Owner-Satz zuerst; Phasen darunter; A13 nicht Owner.
NACHWEIS: Hebel 3 erster Vertragssatz.
RESTRISIKO: A07-N3 vs Tool-end_call-Grenze bleibt A01, Prompt heilt sie nicht.

BEFUND_ID: K01-4
AKZEPTIERT
BEGRÜNDUNG: Delta ohne VoicePort ist Cadence-2.
ÄNDERUNG: Matrix Gate A = keine Mid-Call-Voice-Mutation; Arming = State+Tool.
NACHWEIS: Hebel 4 Tabelle.
RESTRISIKO: Stimme ändert sich mid-call nicht — A14-Grenze, bewusst.

BEFUND_ID: K01-5
AKZEPTIERT
BEGRÜNDUNG: K01-Freigaberegel gilt für neue IDs und neue Maschinen.
ÄNDERUNG: Ausfalltabelle unten. Keine erfundenen P95.
NACHWEIS: Abschnitt „Ausfall je neuem Vertrag“.
RESTRISIKO: Zahlen sind HYPOTHESE, nicht SLA.

BEFUND_ID: K01-6
AKZEPTIERT
BEGRÜNDUNG: ohne Delta-Satz wäre Hebel 5 eine Wiederholung.
ÄNDERUNG: „Warum neu“ auf Persist-Schwelle und Belief-Körnung begrenzt.
NACHWEIS: Hebel 5.
RESTRISIKO: nächster Chat mergt die drei Flächen wieder zu „Spoken-Lock“.

BEFUND_ID: K01-7
AKZEPTIERT
BEGRÜNDUNG: VAD-Text und unbound Hold sind die bekannten Fehlbauten.
ÄNDERUNG: Tor-Tabelle; Idle-Watchdog; Abgrenzung Face/Want.
NACHWEIS: Hebel 7.
RESTRISIKO: wait_for_user ≠ Repair; Feld existiert nicht.
```

### Ausfall je neuem Vertrag (Nacharbeit K01-5, alles HYPOTHESE)

| Vertrag | Timeout-Idee | Fehlerzustand | Späterer Test |
|---|---|---|---|
| Stufe-B-Unlock | Unlock-Deadline nach Cut | Force-End, keine neue Generation | Cancel ohne Clear + Reststille ⇒ Unlock via Watchdog, nicht ewig |
| Stufe A | keine Unlock-Deadline | Resume derselben generation_id | mhm ⇒ keine cancel/clear-Events |
| `playout_ms` | EOT ohne Cursor | `heard unknown`, kein Fake-Commit | T_heard = instrument_missing, nicht 0 |
| `heard_*` + `expected_rev` | Konflikt Hangup vs Barge-Ack | reject / retry einmal, kein stiller Blob-Overwrite | doppelter Ack gleicher Cursor = No-Op |
| `hangup_act` | Watchdog statt 8-s-Semantik | gehört wenn playout>0, sonst Drop | Interrupt in Tx ⇒ kein last_line-Heard |
| Prefix-Freeze | n/a (statisch) | `cache_bust` PRODUCT an generation_id | Prefix-Hash konstant über n Turns |
| `ops_trace_id` | fehlt bei Connect | Call ohne Ops-Join, nicht Token loggen | Log-Stichprobe ohne session_id |
| `session_ref` | Delete ohne Hash-Zeile | Usage nicht aggregierbar; Token darf nicht nachwachsen | Delete ⇒ GET 404, Usage ohne Bearer |
| `live_call_id` | Provider-ID fehlt | Ledger-Zeile ohne Anbieter-Join | nie als URL-Zugang |
| `start_attempt_id` | doppelter Start | Unique liefert dasselbe Token | 10 parallele Starts → 1 Session |
| `silence_intent` | Hold-Bound = Idle-Watchdog | `yield` oder sichtbares Drop | T_eot während hold+mhm nicht als Takeover |

007-A01-Ausfalltabelle (`session_id`, `call_attempt_id`, `generation_id`, `sequence_number`, `heard_ms`, `freeze_id`) bleibt gültig. `heard_ms` dort = State-Commit; Quelle jetzt `playout_ms`, nicht User-`audio_end_ms`.

Keine P95-Garantie. Kein Retry ohne Bound. Eval darf Unlock/Hangup nicht blockieren.

---

## Phase 6 — K01 Retest

```text
GEGENPRÜFUNG (Retest)
Prüfumfang: nur K01-1…7 und angrenzend Ausfalltabelle. Kein Vollneustart.
Durchgeführte Angriffe: 007-A01-AND noch parallel gültig? Drei Heard-Schreiber? Hangup-Owner-Steal? Voice-Delta=update? IDs ohne Ausfall? Spoken-Lock-Kopie? silence_intent→VAD? VERIFIZIERT missbraucht? GO-1/GO-2 angefasst?
```

BEFUNDE nach Retest: keine neuen. K01-1 bis K01-7 in Hebel 1–7, YAML `supersedes_partial`, AVOID-Tafel und Ausfalltabelle sichtbar.

Zwei A01-Unlock-Formeln: 008 sticht, 007-A01 Hebel 2 ist im Dateikopf aufgehoben. Owner bleibt State Engine. VoicePort DEFER. Belief abgeleitet.

```text
URTEIL: FREIGEGEBEN
als AUSTAUSCH-Recherche. Keine Bau-Freigabe. Keine Vertragsänderung im Produkt. Produktqualität UNBEKANNT.
```

---

## Phase 7 — Übergabe

```text
AUFTRAG_ID: CHG-20260919-008-A01
ERGEBNIS: Sieben neue Zwischen-Rollen-Verträge aus dem 007-Austausch, nicht in 007-A01. (1) Zweistufiges Barge, Unlock nur Stufe B, AND aufgehoben. (2) Drei Heard-Objekte playout_ms → heard_* → spoken_belief; User-audio_end_ms ist nicht Assistant-Heard. (3) hangup_act gewählt/gesprochen/gehört/verworfen; sichtbares Ende=Heard; Owner bleibt State Engine. (4) Mutability-Matrix: Prefix fest, Hangup-Arming=State+Tool, Voice-Delta DEFER, Cadence-2 AVOID. (5) Persist=Heard-Ack ≠ Context-Lock ≠ Belief. (6) ops_trace_id ≠ session_ref ≠ live_call_id. (7) silence_intent als Pause-Gate. Stack gpt-realtime-2.1. Kein Bau.
GEÄNDERTE_DATEIEN_UND_VERTRÄGE: .cursor/decisions/CHG-20260919-008-a01-architektur.md — keine Produktverträge, kein Code, GO-1/GO-2 unberührt.
NACHWEISE_UND_TESTS: Quellen = 14× CHG-20260919-007-*.md; Stichprobe gegen 007-A01-Negativliste. Kein Lauf, kein Hörtest.
QUALITÄTSWIRKUNG: UNBEKANNT. Verträge sollen Unlock-Deadlock, Heard-Quellenkollision, Hangup-Uhr-Split, Prefix-vs-Arming und Token-in-Logs verhindern, nicht Realismus behaupten.
KOSTENWIRKUNG: null jetzt. Cadence-2-AVOID und Truncate≠Ersparnis bleiben A12-Politik. Mini nicht Floor. Kein Providerwechsel.
RISIKEN_UND_OFFENE_HYPOTHESEN: A06-Schwelle fehlt → HEAD Stufe B; playout_ms ungebaut; live_call_id könnte das Token sein; VoicePort unbelegt; S2S-end_call-Grenze ungeheilt; silence_intent HYPOTHESE; 008-Unlock sticht 007-A01-AND — Zitatrisiko. Kein 2×-Claim.
GEGENPRÜFER_URTEIL: FREIGEGEBEN (AUSTAUSCH); keine Bau-Freigabe
NÄCHSTE_ROLLE: A00 bündelt Schleife 3. Kein Bau. Falls später GO: genau eine Primärrolle — Handshake Stufe A/B eher A04+A06 nach diesem Vertragstext; hangup_act-Phasen eher A01-Text dann A06 Tx; Observability-IDs eher A10+A05; silence_intent eher A13 Schema dann A01 Vertrag.
KONTEXT_FÜR_NÄCHSTEN_CHAT: gpt-realtime-2.1 bleibt. 007-A01-AND für Unlock ist aufgehoben. audio_end_ms (speech_stopped) ist User-EOT, nicht Assistant-Heard. Hangup-Owner bleibt State Engine; Phasen sind gewählt/gesprochen/gehört/verworfen. Hangup-Arming ohne Prefix-Mutation. Persist=Heard-Ack. ops_trace_id minten, session_id nicht loggen. Truncate bleibt verboten. GO-1/GO-2 nicht aus dieser Karte öffnen.
```
