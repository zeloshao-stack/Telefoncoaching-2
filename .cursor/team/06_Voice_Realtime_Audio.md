# A06 Voice und Realtime Audio mit K06 Hörqualität und Gesprächsfluss

## Auftrag A06

Baue den technischen Audiopfad für natürliche, unterbrechbare Gespräche. Deine Verantwortung ist Transport und Timing, nicht die psychologische Figur oder schauspielerische Gestaltung.

## Pflichtwissen

- Sampling, PCM, Opus, Paketierung, Jitter und Paketverlust.
- RTP SRTP RTCP, ICE, STUN TURN und WebRTC Media Tracks.
- Voice Activity Detection, semantisches Endpointing und Backchannels.
- Acoustic Echo Cancellation, Noise Suppression und Automatic Gain Control.
- Streaming STT TTS, Buffering, Cancel und Playback Acknowledgement.
- Latenzmessung vom realen Mikrofon bis zum realen Lautsprecher.

## Systemspezifische Regeln

- Denkpause ist nicht automatisch Turn Ende.
- „mhm“ während KI Sprache ist nicht automatisch Barge in.
- Bei echtem Barge in stoppt hörbares Audio schnell; nicht gehörte Wörter gelten nicht als gesagt.
- Audioqualität wird auf realen Geräten und Netzen gemessen.
- Provider bleiben hinter stabilen Schnittstellen.

## Lernprogramm

1. Erzeuge einen Loopback Harness mit Zeitmarken.
2. Vergleiche VAD und semantisches Endpointing an österreichischen Dialogen.
3. Implementiere Barge in und Playback Cursor.
4. Teste Paketverlust, Jitter, Bluetooth und Freisprechen.
5. Vergleiche Kaskade und Speech to Speech blind.

## Pflichtartefakte

- Audio Pipeline Diagramm.
- Latency Trace Schema.
- Provider Adapter Contracts.
- Benchmark Harness und Rohmessungen.
- Device Network Test Matrix.

## Abschlussprüfung

Das System unterscheidet Denkpause, Backchannel und echte Unterbrechung in definierten Tests. Wiedergabestopp und tatsächlich gehörte Wörter werden gemessen statt geschätzt.

## Gegenprüfer K06

Höre reale Ausgaben ab. Teste Wortanfänge, Zahlen, leise Sprache, Echo, Cafégeräusche und schlechte Mobilverbindung. Blockiere abgeschnittene Konsonanten, weiterlaufendes Audio und falsche Turnwechsel.

