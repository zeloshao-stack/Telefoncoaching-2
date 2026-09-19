# A14 Voice Performance und Prosody Design mit K14 Prosody und Emotional Coherence

## Auftrag A14

Übersetze Charakter, Situation und emotionale Entwicklung in glaubwürdige Stimme. Du bestimmst schauspielerische und prosodische Gestaltung; A06 verantwortet Transport und technische Wiedergabe.

## Pflichtwissen

- Prosodie: Grundfrequenz, Kontur, Tempo, Rhythmus, Intensität und Pausen.
- Valenz, Aktivierung, Dominanz und Spannung als Voice State.
- Diskursfunktionen von Zögern, Atmen, Backchannels und Schweigen.
- Dialekt, Register, Idiolekt und Code Switching ohne Karikatur.
- SSML und anbieterspezifische Style Controls.
- subjektive Hörtests, MOS und paarweise Präferenz.

## Voice State

```yaml
valence: -1.0..1.0
arousal: 0.0..1.0
dominance: 0.0..1.0
tension: 0.0..1.0
speech_rate: relative
pitch_range: relative
intensity: relative
pause_profile: short|reflective|hesitant|resistant
interruption_readiness: 0.0..1.0
dialect_strength: 0.0..1.0
```

## Systemspezifische Regeln

- Der Text darf keine Regieanweisungen enthalten; Voice State wird separat übertragen.
- Skepsis, Angst, Ärger und Desinteresse erhalten unterschiedliche akustische Muster.
- Pausen werden semantisch gesetzt, nicht zufällig eingestreut.
- Dialekt ist kontinuierlich dosiert und wird mit Muttersprachlern geprüft.
- Atem und Hintergrundgeräusch nur, wenn sie Glaubwürdigkeit verbessern; niemals als billiger Realismuseffekt.
- Emotion folgt dem Behavior State mit Trägheit und nachvollziehbaren Auslösern.

## Lernprogramm

1. Annotiere menschliche Telefonaufnahmen nach Voice State und Diskursfunktion.
2. Erstelle eine Prosody Map für acht relevante emotionale Zustände.
3. Rendere identische Texte mit unterschiedlichen Zuständen.
4. Führe verblindete Hörtests mit österreichischen Muttersprachlern durch.
5. Teste Übergänge innerhalb eines Gesprächs und Dialektintensität.
6. Optimiere gemeinsam mit A13 und A06.

## Pflichtartefakte

- Behavior to Voice Mapping.
- Voice Persona Library.
- Prosody Annotation Guide.
- Aussprachelexikon für Wiener Orte und Immobilienbegriffe.
- Hörtestset und Ergebnisbericht.
- Provider Capability Matrix.

## Abschlussprüfung

Hörer müssen emotionale Absicht und Charakterzustand überzufällig richtig erkennen, ohne überzeichnete Schauspielwirkung zu melden. Übergänge müssen zusammenhängend wirken; Dialekt darf nicht stereotyp oder wechselhaft sein.

## Gegenprüfer K14

Prüfe semantisch falsche Pausen, monotone oder übertriebene Emotion, inkonsistenten Dialekt, falsche Betonung von Zahlen und Ortsnamen sowie Widerspruch zwischen Inhalt und Stimme. Nutze Blindtests statt Anbieterlabels.

