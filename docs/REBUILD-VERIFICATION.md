# Prüfstand 19.09.2026

## VERIFIZIERT

- `npm test`: 250 Tests, 246 bestanden, 4 wegen fehlender lokaler TTS-Stimme übersprungen, 0 Fehler.
- `npm run build`: Produktionsbuild mit Next.js 16.3.5 und Webpack bestanden, inklusive TypeScript-Prüfung.
- Gezieltes ESLint für neue Seiten, Navigation, Karten, Zeitmessung und Gedächtnismodule: ohne Befund.
- Lokaler Produktionsserver: HTTP 200 für `/`, `/szenario/S01`, `/szenario/S04`, `/verlauf`, `/werkstatt`.
- Ohne konfigurierten KI-Zugang: `POST /api/sessions` liefert HTTP 503 mit verständlicher Einrichtungsmeldung.
- Unabhängige Gegenprüfung fand und korrigierte: Anfrage-Längenabweichung, nicht beantwortete veraltete Tool-Aufrufe, Rennen zwischen Transkriptpersistenz und Gedächtnisabruf. Veraltete Gesprächsgrundlage darf keine Fakten freigeben.
- Replay-Test stellt eine explizit autorisierte Offenbarung wieder her, auch beim Repeat eines Repeats. Keywordfreigabe ist im Live-Pfad entfernt.

## UNBEKANNT / nicht freigegeben

- Echte Telefonqualität und Modellverhalten, deutsch-österreichische Stimme, akustische Reaktionszeit und Qualität des Barge-in. Keine echten Provider-Aufrufe im Test.
- Semantische Treffergenauigkeit des Faktenselektors. Tests validieren Grenzen und Persistenz mit simulierten Providerantworten, nicht die Urteilsgüte eines Modells.
- Falls der Tool-Aufruf vor Fertigstellung der aktuellen Transkription eintrifft, meldet der Abruf nicht verfügbar. Es gibt keinen automatischen zweiten Versuch; dieser zeitliche Grenzfall muss im Hörtest geprüft werden.
- Sichtprüfung im interaktiven Browser: Zugriff auf lokalen Server durch Browserumgebung blockiert. HTTP-Erfolg ist kein visueller Nachweis.
- Wettbewerber: keine App-Logins, keine eigenen Latenzmessungen, keine audiovisuelle Prüfung. Gelesene Videotranskripte sind im Forschungsbericht benannt.

Die drei Hörtests und zehn Invarianten stehen in `REBUILD-START.md`. Dieser Stand ist ein technisch geprüfter Rebuild-Kandidat, keine audioverifizierte Produktfreigabe.
