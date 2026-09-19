# Wissen: Scoring- und Szenenhandbuch

**Version 1.1** · Arbeitsgrundlage für Produkt und Bau, nicht der laufende Textloop-PR.

Volltext (Quelle der Wahrheit): [Immobilien-Telefoncoach_Scoring-und-Szenenhandbuch_v1.1.md](../sources/Immobilien-Telefoncoach_Scoring-und-Szenenhandbuch_v1.1.md)

Einordnung im [Projektbaum](../projektbaum.md): Szenenbaukasten, Scoringformel, Kern-Szenen, Auswertung. KB: [Gesamtwissen](README.md).

## Was es ist

Handbuch für einen **Immobilien-Telefoncoach** (Makler, Zinshaus, später Hausverwaltung). Kein allgemeiner Sales-Coach, kein Call-Center-Monitoring. Versprechen: in wenigen Klicks ein realistisches Rollenspiel, danach **eine** umsetzbare Verbesserung.

## Wie es Pack-JSON und Anti-Monster schneidet

| Schicht | Gilt |
|---|---|
| Szenen**inhalt** und Pflichtfelder (`ScenarioSpec`) | **Handbuch 1.1** — erweitert `Telefoncoaching-Testfaelle.json` |
| S01–S03, Textloop, Role-Engine, lokale DB | **Pack + Vorgehen** — erstes übbares Stück |
| Start ohne Mixer, eine Anlasskarte, kein % auf dem Schirm | **Anti-Monster** — bleibt, auch wo das Handbuch vier Dropdowns und 0–10-Gesamtscore beschreibt |
| N/A ≠ 0, Zitat + Turn, ein Hebel, Repeat an der Stelle | **beide** — das bauen wir |

Pack-JSON bleibt Fixture für S01–S03 (Briefing, `private_state`, Rubrik 0–4, Testturns). Das Handbuch liefert die Immobilien-Szenenbibliothek, BARS-Anker, Anti-Patterns und die Score-Engine **im Code**. Wo die Oberfläche streitet, siegt Anti-Monster, bis Reinhard die Formel auf den Schirm holt.

Nicht hier verdoppelt: die 14 Kern-Szenen im Wortlaut, die 80/20-Formel im Detail, Careertrainer-Kapitel.
