# CHG-20260919-008 — Entscheidungspaket A02 + Business Owner

```yaml
change_id: CHG-20260919-008
author: A00
reviewer: K00
status: BO-KREUZ T (CHG-20260919-009)
gate: Gate A / G2
code: none
legal_guarantee: none
quality_claim: none
bo: Reinhard
produktleitung: A02
vorlage: .cursor/decisions/CHG-20260919-008-a02-produkt.md
nicht_dieser_chat:
  - Produktcode
  - BO-Beschluss durch A00
  - Implementierungsauftrag
  - GO-1-Reopen
  - GO-2-Überschreiben
```

A00 entscheidet **nicht** für den Business Owner. Dieses Paket ist die Kreuz-Vorlage nach Schleife 3. Ohne Kreuz: kein Bau.

Autoritative Produktvorlage: `CHG-20260919-008-a02-produkt.md`. Die 14 Fachdossiers `008-a01` … `008-a14` sind FREIGEGEBEN als Austausch, nicht als Auftrag. `006` / `007` bleiben gültig und werden hier nicht nacherzählt.

---

## 1. Was fertig ist

| Schleife | CHG | Inhalt | Stand |
|---|---|---|---|
| 1 Deepsearch | 006 | Steal / Avoid / Defer je Rolle | fertig, gültig |
| 2 Austausch | 007 | fremde Segmente gelesen, Fork-Bild geschärft | fertig, gültig |
| 3 Widersprüche | 008 | Verträge zwischen Rollen geschlossen (Ideen) | fertig, **kein Code** |

**GO-1 gebaut.** Sprechkanal = unbeschriftete Ich-Szene. Nicht wieder öffnen, kein REGELN-/Nie-Listen-Prefix.

**GO-2 getrennt.** Live-Chrome sitzt in `ConversationView`. Nicht überschreiben, nicht in einen T-GO ziehen. GO-2-Schluss: **UNBEKANNT** (nicht neu geprüft).

Kein Billing, kein Mandant, kein Studio.

---

## 2. Gate-A-Invarianten

Unverändert. Ein Kreuz ändert sie nicht.

- Ein **5-Minuten**-Gespräch im Browser. **Audio first.** Kein Avatar.
- Barge-in hörbar. mhm ≠ Unterbrechung. Auflegen plausibel. Figur konsistent (Face/Want).
- Figur hilft nicht systematisch. **Menschlich + hilfreich = Fail.**
- Rubrik unsichtbar im Call. **Isolation = Architektur, nicht Lernziel.**
- Stack: **gpt-realtime-2.1**. Mini nicht Floor.
- **Kein Gym. Kein MOS. Kein Provider-Swap.**
- Transparenzsatz = Pflichtfläche, kein Trainingspass.
- Qualitätsclaims ohne versiegelte Freeze-ID sind ungültig — das ist kein fünftes Trainingskriterium.
- Kein 2×-Claim. Keine Rechtsgarantie.

---

## 3. Forks (laut A02)

### Leben — BO darf genau einen ankreuzen

| Fork | Beobachteter Fail, den der BO nennen muss | Primär | Neben nur bei echter Vertragsberührung |
|---|---|---|---|
| **T** Transport / Heard | Barge-in bleibt stehen, mhm klaut den Turn, Figur antwortet auf Ungespieltes | **A06** | A04 Uhr/Stufe A; A01 `heard_ms`-Alias im State |
| **C** Charakter Face/Want | Figur klingt menschlich und hilft / tröstet / erklärt | **A13** | A07 Restverbote nur nach Hörprobe, nach Vertragsberührung |
| **M** Messung | Team behauptet Qualität ohne versiegelte Stichprobe | **A09** | — |
| **$** Ledger | Kosten ungezählt, Swap-Diskussion ohne `usage` | **A05** | A10 `ops_trace_id` minten, nicht zweiter Owner |

### Geparkt

| Fork | Fail | Primär später | Sperre |
|---|---|---|---|
| **U** UX-Anrufhandlung | Nutzer erlebt Chat+Orb statt Telefon | **A03** | bis GO-2-Schluss **oder** begründeter BO-Override. Nicht in der Kreuz-Zeile. |

### Tot als GO in Gate A

Transparenz · Drill-Gym · MOS / Elo / Arena · Provider-Swap · Isolation als Lernziel · T+C in einem GO.

---

## 4. A02-Empfehlung — kein Beschluss

Genau **ein** Fork, genau **eine** Primärrolle.

**Kleinster Call-GO, nur wenn der BO T ankreuzt:** Fork **T**, Primärrolle **A06** (Heard-Cursor + mhm Stufe A). Stack 2.1.

Das ist eine **Abhängigkeits-Empfehlung**, keine Ohr-Krone. T entsperrt die Falsifikation von C-Heard-Hebeln, M9 und U. **C (Face/Want) bleibt unabhängig kreuzbar.** T ist **kein** beobachteter Trainee-Fail.

| Wenn der BO kreuzt … | Fork | Primär | Nicht in diesem GO |
|---|---|---|---|
| T **ausdrücklich** (Fail genannt **oder** „kein eigener Fail — ich kreuze T“) | T | A06 | Prompt, Gym, Modell, Orb, Ledger, Freeze-als-Ohr, C |
| „menschlich und hilft / tröstet / erklärt“ | C | A13 | Provider, Gym, Nie-Liste im Player, Transport-Patch |
| „Qualität ohne Stichprobe“ | M | A09 | MOS-Kauf; Golden+Codes an A07; M9 mit Fake-Null |
| „Kosten ungezählt / Swap ohne usage“ | $ | A05 | Mini-Default; A10 als Mit-Primär |
| Chat+Orb | — | — | U gesperrt bis GO-2-Schluss |

Ohne Kreuz: **kein Bau.** Empfehlung ohne T-Kreuz ist kein GO.

**Abbruch jedes GO:** sobald der Patch Billing / Mandant / Studio, zweites Framework, Mini-Floor, MOS-Gate, Drill-Gym, Isolation-als-Drill oder einen zweiten Fork zieht.

---

## 5. Was A06 bauen würde — nur nach T-Kreuz

Quelle: `CHG-20260919-008-a06-transport.md`. Ohr = EXPERIMENT. Kein Qualitätsclaim.

**In diesem GO**

- **Stufe A / B.** A = mhm/Noise: Remote halten, kein cancel, kein clear, dieselbe `generation_id`. B = echter Inhalt: Freeze → Cut → cancel/clear → Heard-Ack. Unlock nur B.
- Prefix `interrupt_response: false` **erst** mit Stufe-A-Bau. HEAD ist faktisch immer B.
- **`heard_ms`-Alias.** Assistant-Heard ← `playback_cursor_ms`. User-Commit ← `audio_end_ms` nach mhm-Gate. Fail = `unknown` / `instrument_missing`, kein Fake-0.
- Stack bleibt **gpt-realtime-2.1**.

**Neben, nur bei echter Vertragsberührung — nicht Mit-Primär**

- A04: Playback-Uhr, Stufe-A-Hold im Client.
- A01: `heard_ms`-Alias in der State Engine (nicht `speech_stopped` → Assistant-Heard).

**Nicht in diesem GO**

- `conversation.item.truncate` auf WebRTC.
- `semantic_vad` / `eagerness: high`.
- `silence_intent` (A13-Feld, Enablement — nicht dieser Patch).
- Hold/Yield als Acting-Feld (A14 — nicht dieser Patch).
- Eager-End auf Stufe A. Resume gilt als HYPOTHESE (2.1 Pause-ohne-Clear unbelegt).
- Chrome / Orb / Timer (GO-2). Prompt-Rewrite. Ledger. Freeze-Lauf.

---

## 6. Was ohne Kreuz nicht gebaut wird

Alles. Insbesondere:

- kein A06-Transport, kein Heard-Cursor, kein Stufe-A-Resume
- kein A13 Face/Want / Spoken-Belief / Hangup-Akt
- kein A09 Freeze / M1 / M9
- kein A05 Ledger (`usage` / `cost_trace`)
- kein A03-Chrome, kein A07-Prompt, kein A14-Acting
- kein Gym, MOS, Swap, Transparenz-GO
- kein GO-1-Reopen, kein GO-2-Diff

Vorlage ≠ Beschluss.

---

## 7. Offene Hypothesen — nicht als Tatsache lesen

| Punkt | Stufe | Folge |
|---|---|---|
| Dominanter Fail am **Ohr** | **UNBEKANNT** | kein Hörtest, kein Trainee-Lauf in 006–008 |
| **C0** / Produktqualität | **UNBEKANNT** | A09: kein Gate, kein MOS |
| **GO-2-Schluss** | **UNBEKANNT** | U bleibt geparkt |
| Resume Stufe A ohne `clear` | HYPOTHESE | sonst nur kurzes Mute + Cap→B |
| AudioContext auf WebRTC (Chrome **und** Safari) | HYPOTHESE | sonst `heard unknown` |

Diagnostisch (PLAUSIBEL): ohne Heard-Cursor + Stufe A sind C (Glaube nach Schnitt), M9 (Context ≠ Gehörtes) und U (Schlusssatz vs Drop) nicht ehrlich beobachtbar. Das verschiebt die **Reihenfolge**, nicht den gehörten Fail.

---

## BO-KREUZ

Genau ein Kasten. Dann ein Satz: beobachteter Fail **oder** „kein eigener Fail — Empfehlung T gilt, ich kreuze T“.

In-Gate-A-Liste §2 unverändert, außer der BO ändert sie ausdrücklich. Non-Goals bestätigt: kein Gym, kein MOS, kein Swap.

`BO-KREUZ: [x] T=A06  [ ] C=A13  [ ] M=A09  [ ] $=A05  [ ] keines`

Sprachbefehl 19.09.2026 06:38: „verbessere einfach wesentlich“. Kein eigener Fail genannt — A02-Empfehlung T gilt. Bau: CHG-20260919-009, Primär A06.
