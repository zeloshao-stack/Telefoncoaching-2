import Link from "next/link";
import { ArrowUpRight, AudioLines, FilePenLine, PhoneIncoming } from "lucide-react";
import { hasRealtimeKey } from "@/lib/openai-realtime";
import { llmStatus } from "@/lib/llm";
import { TimingDiagnostics } from "@/components/training/TimingDiagnostics";
export const dynamic = "force-dynamic";
export default function Workshop() {
  const voice = hasRealtimeKey();
  const text = llmStatus();
  return <div className="workshop"><p className="eyebrow">Einstellungen & Werkstatt</p><h1>Die Grundlage Ihrer Gespräche.</h1><p className="intro-copy">Verbindungen prüfen und Trainingsmaterial bearbeiten.</p>
    <section className="connection-panel"><h2>Verbindungsstatus</h2><dl><div><dt>Telefontraining</dt><dd>{voice ? "Zugang konfiguriert · Hörtest ausständig" : "Noch nicht verbunden"}</dd></div><div><dt>Coach & Auswertung</dt><dd>{text.connected ? "Zugang konfiguriert" : "Noch nicht verbunden"}</dd></div></dl>{!voice && <p>Tragen Sie OPENAI_API_KEY in der lokalen Datei .env.local ein und starten Sie die Anwendung neu. Schlüssel werden ausschließlich auf dem Server gespeichert. Ohne Zugang starten keine echten KI-Gespräche.</p>}<p className="text-muted-foreground text-sm">Ein eingerichteter Zugang bestätigt noch keine erreichbare Verbindung oder geprüfte Sprachqualität.</p></section>
    <div className="workshop-links">{[{ href: "/autor", title: "Szenarien bearbeiten", description: "Öffentliches Briefing und verborgene Hintergründe pflegen.", icon: FilePenLine }, { href: "/stimme", title: "Stimmenwerkstatt", description: "Stimmen und bestehende Hörproben verwalten.", icon: AudioLines }, { href: "/gespraeche", title: "Echte Gespräche", description: "Eigene Gesprächsfälle mit Einwilligung aufbereiten.", icon: PhoneIncoming }].map(({ href, title, description, icon: Icon }) => <Link href={href} key={href}><Icon /><h2>{title}</h2><p>{description}</p><ArrowUpRight /></Link>)}</div>
    <TimingDiagnostics />
  </div>;
}
