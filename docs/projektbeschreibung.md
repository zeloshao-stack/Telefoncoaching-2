# Projektbeschreibung — KI-Telefoncoaching (für externes Review)

Stand 18.09.2026. Auftraggeber: Reinhard Manzl, erfahrener Wiener Investmentmakler. Bitte gegenchecken: Widersprüche, fehlende Stücke, Feature-Monster, Scoring, Wissensarchitektur, zwei Oberflächen.

## 1. Was das Produkt ist

Ein **Telefon-Übungstool** für Reinhard. Er trainiert **Deliberate Practice**, kein Quiz und kein Skript:

1. Nur das öffentliche Briefing sehen.
2. Frei als Makler sprechen gegen eine **konsistente Gegenseite** mit **verdecktem Zustand** (Interessen, Grenzen, Vollmacht, BATNA, Verfassung, Verkaufswille).
3. Harte Regeln: kein Abschluss ohne Vollmacht, keine erfundenen Käufer, Auflegen ist erlaubt.
4. Getrennte Bewertung mit **Zitat**; Stil ≠ Substanz; berechtigtes Nein ist kein Misserfolg.
5. **Ein** Hebel, **ein** Profi-Tipp, **dieselbe Stelle** wiederholen.

Branche: **Wiener Zinshaus / Investmentimmobilien**, Locale **de-AT**, Anrede Sie. Kein universelles Vertriebsprodukt, keine Trainer-Plattform, kein Call-Center-Monitoring.

Es gibt bereits einen **KI-Vertriebscoach** (Chat: Nutzer stellt Fragen, bisher oft generische Sales-Karten wie Kaltakquise/Closing). Der soll **dieselbe Knowledge Base** nutzen wie das Telefontool — andere Handhabe, keine zweite Wissensinsel.

## 2. Sofort-Tool (was jetzt funktionieren muss)

Eine Next.js-Web-App (TypeScript, Tailwind, shadcn, eine App, kein Nx).

**Erster Klick:** Szenario **S01 Honorarvergleich**. Daneben S02 Klare Ablehnung, S03 Miteigentümer.

Loop: öffentliches Briefing → Textgespräch → Scoring → ein Profi-Tipp → Repeat.

- Kein Mixer, kein Würfel, kein Mikrofon, keine Paywall, kein Fake-Live-Mic.
- Trainee sieht nur `public_brief`. `private_state` bleibt verdeckt, bis die Figur es sagt.
- Role Player (KI-Gegenseite) **kennt die Rubrik nicht**.
- Ohne API-Key: Mock-Gegenseite, App bleibt übbar. Key serverseitig, nie im Browser.
- Persistenz: SQLite, ein Nutzer (Reinhard).

## 3. Fünf Produktmodule

1. **Szenario schreiben** (als Nächstes) — Autor trennt öffentlich/verdeckt. Beispiel: Zinshausverkäuferin, 65, Haus Wallnerstraße, schöne Fassade = öffentlich. Verdeckt: Wie geht es ihr körperlich? Will sie verkaufen? Hat sie schon mit jemandem gesprochen? Selbst erstellen und Upload füllen das. Würfel füllt es später.
2. **Üben** (sofort) — Anruf; Gegenseite weicht aus. Text jetzt, Mic später.
3. **Scoring** (sofort) — ein Hebel, Zitat, Skala **0–4 + Enthaltung/N/A**. Kein % auf dem Schirm.
4. **Profi-Tipps** (sofort) — ein zitierter Tipp, dann Repeat. Kein Tipp-Schwall.
5. **Hausverwaltung** (später) — eigene Welt: Kundenbeschwerden, Professionisten, Eskalation. Nicht auf den S01-Start. Nicht ins Akquise-Scoring mischen.

Fragen (Q&A) ist **kein** sechstes Modul, sondern die zweite Handhabe.

## 4. Zwei Handhaben, ein Wissen

| | Fragen (bestehender Vertriebscoach) | Üben (Telefontool) |
|---|---|---|
| Nutzer | fragt | spricht; Figur weicht aus |
| Wissen | dieselbe KB (Zinshaus/Wien/Reinhard) | dieselbe KB |
| v1 | anbinden, nicht das Sofort-Tool | das Sofort-Tool |
| Im Call | **kein Flüstern** (kein Balto) | Role Player ohne Rubrik |
| Danach | nach Auflegen oder expliziter Pause: Coach fragen OK | Scoring + ein Tipp |

Fragen sieht nie `private_state` einer **laufenden** Sitzung. Generische Closing-Karten aus dem alten Chat werden **ersetzt**, nicht als KB übernommen.

## 5. Wissensarchitektur (ohne App-Umbau erweitern)

Vier Schichten:

1. **Versionierte Wissensdateien** — Szenen, Psychologie (Quellen, nicht eine Wahrheit), Scoring-Regeln, Profi-Tipps, später Pausenregeln. Neue Szene = neue Datei.
2. **Figuren als Daten** — `public_brief` vs `private_state`. Kein 3-D-Studio.
3. **Adapter** — LLM tauschbar (besseres/latenzärmeres Modell hinter derselben Tür). Stimme/Mic später gleicher Sitzungsvertrag. Evaluator getrennt vom Role Player.
4. **App-Loop** — unverändert, solange Verträge halten: `public_brief`, `private_state`, `session_id`, Auswertung mit Zitat.

Weiterlernen: beendete Sitzung **darf einen Patch vorschlagen**; Reinhard nimmt an oder lehnt ab. Nichts automatisch. Alte Sitzungen behalten ihre **Rubrik-Version**.

## 6. Später

- Würfel/Zufallsgenerator (ein Draft-PR existiert, ist **geparkt**).
- Mikrofon: explizite Taste „Mikrofon aktivieren“, Browser-getUserMedia, Gerät/Picker, verweigert/blockiert, HTTPS, Text bleibt Fallback. Auflegen stoppt Audio. Kein stilles Lauschen.
- Stimme (OpenAI Realtime/WebRTC) auf denselben Sitzungen.
- Hausverwaltung-Spur.
- Pausenanalyse erst mit Audio-Zeitstempeln.

## 7. Bewusst nicht

Keyword-Gesprächsbaum · Nx-Monorepo · zweite Trainings-App · CRM · Twilio/SIP · Microsoft-Org · Live-Flüstern · LMS · 3-D-Avatare · Ranglisten · %-Kompetenz auf dem Schirm · Mixer am Start · Paywall im Übungstool.

## 8. Inhaltliche Quellen

- Wissenspack `Telefoncoaching_Gesamtwissen` (Bauarchiv, viele Duplikate; Gesprächsbaum fachlich verworfen).
- **Scoring- und Szenenhandbuch v1.1** = Canon für Szenenfelder, 14 Kern-Szenen, N/A, Belege, Anti-Patterns, ein Hebel. Das Handbuch beschreibt auch Dropdowns am Start und Gesamtscore 0–10 (80/20). **UI-Canon bleibt Anti-Monster:** drei Karten, 0–4 + Enthaltung auf dem Schirm. 0–10 darf später **intern** rechnen, eingeklappt.
- Mapping: S01 ≈ Provision/Alleinauftrag · S02 ≈ Kaltkontakt „kein Verkauf“ · S03 ≈ Erbengemeinschaft. Startheld bleibt S01, auch wenn das Handbuch Zinshaus-Kaltkontakt zuerst nennt.

## 9. Was schon gebaut ist (Draft-PRs, eine Codebasis)

- PR #1 Textloop = Sofort-Tool (S01–S03, Role-Engine, Auswertung, Repeat).
- PR #2 Verlauf = persönliche letzte Sitzungen.
- PR #3 Werkstatt = Würfel/Figuren, **geparkt**.

Stack: Next.js, SQLite, OpenAI optional, de-AT, Lovable-ähnliche Operator-Haut (Creme/Wald/Kupfer).

## 10. Offene Spannungen (bitte besonders prüfen)

1. Handbuch 0–10 + Start-Dropdowns vs. Anti-Monster 0–4 + drei Karten.
2. Ein Wissen für Chat-Coach **und** Telefon — wie verhindert man Leak von `private_state` und Methoden-Cocktail?
3. „Weiterlernende KB“ vs. stabile Noten (Versionierung, kein stilles Nachtrainieren).
4. Szenario schreiben (Wallnerstraße) als Nächstes vs. „Tool muss auf Anhieb gehen“ (S01–S03).
5. Hausverwaltung als eigene Welt vs. eine App.
6. Bestehender Vertriebscoach hat Paywall/Gratis-Chats — darf das die Übungs-App nicht infizieren.
7. Role Player und Evaluator auf demselben LLM-Adapter, getrennte Kontexte — reicht das?

## 11. Bitte im Review

- Was ist unscharf oder widersprüchlich?
- Was fehlt für ein Tool, das Reinhard **allein, sofort** nutzen kann?
- Wo droht Feature-Monster?
- Ist die Trennung öffentlich/verdeckt und Role-Player-ohne-Rubrik tragfähig?
- Scoring + ein Tipp: reicht das als Coaching, oder fehlt etwas Wesentliches ohne Monster zu werden?
