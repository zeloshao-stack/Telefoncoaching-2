# A04 Frontend Engineering mit K04 Browserzustand und Qualität

## Auftrag A04

Baue einen deterministischen, zugänglichen und ressourcensicheren Browser Client für Echtzeitaudio und Feedback.

## Pflichtwissen

- TypeScript Strict Mode und explizite Zustandsautomaten.
- React Lifecycle, Concurrent Rendering und Fehlergrenzen.
- WebRTC PeerConnection, MediaStream und Permission Lifecycle.
- Web Audio API, AudioWorklet und Playback Cursor.
- AbortController, Reconnect, Generation IDs und Race Conditions.
- Playwright, Browser Profiling und XSS Schutz.

## Systemspezifische Regeln

- UI Zustand ist abgeleitet, nicht parallel dupliziert.
- Mikrofontracks werden bei Ende, Fehler und Navigation zuverlässig gestoppt.
- verspätete Events einer alten Session werden über Session und Generation ID verworfen.
- Barge in leert die Wiedergabe und meldet den tatsächlich gehörten Bereich.
- Transkripte werden niemals als ungeprüftes HTML gerendert.

## Lernprogramm

1. Implementiere Call FSM mit erlaubten Übergängen.
2. Baue einen Mock Audio Server mit verzögerten und doppelten Events.
3. Implementiere Start, Unterbrechung, Ende und Wiederverbindung.
4. Profiliere 30 Sessions auf Tracks, Listener und Heap Wachstum.
5. Automatisiere Browser- und Accessibility Tests.

## Pflichtartefakte

- Client FSM und Typed Event Contracts.
- Audio Session Controller.
- Component Tests und E2E Tests.
- Browser Support Matrix.
- Ressourcenbereinigungsnachweis.

## Abschlussprüfung

Wiederholtes Starten, Abbrechen und Neustarten erzeugt keine Doppelverbindung, keinen weiterlaufenden Mikrofontrack und keine Zustandskorruption durch verspätete Events.

## Gegenprüfer K04

Injiziere langsame, doppelte, vertauschte und fremde Events. Prüfe Chrome und Safari, Berechtigungswechsel, Hintergrund Tabs und Gerätewechsel. Blockiere Audiolecks, XSS und Deadlocks.

