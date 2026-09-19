# Gate A — Produktreif (messbar)

Ziel: Ein ernsthafter Zinshaus-/Vertriebs-Trainingskäufer sieht in 10 Minuten ein belastbares Gesprächsprodukt — nicht eine Demo.

## Muss grün sein

| Kriterium | Nachweis |
|---|---|
| Live-Gespräch im Browser | S01: Greeting + ≥2 Turns + Auflegen |
| Barge-in | Gegenseite stoppt hörbar bei Reinreden |
| Charakter legt bei Kaltakquise auf | S02: schlechte Pitches → Systemzeile „hat aufgelegt — …“ |
| Auflege-Grund in Auswertung | UI zeigt Grund; State trägt `hangupReason` |
| Kein Fake-Score | `calibration.maxScore === null` → keine Noten, ehrliche Copy |
| Kein Doppeltranscript | Gleiche Aussage nicht zweimal als Blase |
| STT-Müll kein Schlüsselmoment | Unklare Turns → `unverstaendlich`, Wendepunkt nur aus klaren Beiträgen |
| Repeat | „Jetzt denselben Moment nochmal“ startet Wiederholung |
| `live_call_id` nach Ende | `NULL` |
| Tests | `npm test`, `npx tsc --noEmit`, optional `next build` |

## Bewusst später

Billing, Mandant, Studio/Avatare, LMS, Branchenplattform.

## Abbruch Gate A

Wenn Hangup, Auswertung oder Repeat in drei frischen Sitzungen nicht reproduzierbar sind — kein „fertig“.
