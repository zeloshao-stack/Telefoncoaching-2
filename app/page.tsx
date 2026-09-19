import Link from "next/link";
import { Headphones, ArrowUpRight } from "lucide-react";
import { frozenScenarios, SCENARIO_BLURBS, SCENARIO_COUNTERPARTS, type FrozenScenarioId } from "@/lib/content/pack";
import { toSceneCard } from "@/lib/scene-card";
import { SceneCard } from "@/components/training/SceneCard";
import { listRecentSessions } from "@/lib/sessions";
import { hasRealtimeKey } from "@/lib/openai-realtime";
export const dynamic = "force-dynamic";
export default function HomePage() {
  const latest = listRecentSessions(8, "immobilien")[0];
  const ready = hasRealtimeKey();
  return <div className="training-home">
    <section className="training-intro">
      <div><p className="eyebrow">Ihr Gespräch. Ihr nächster Schritt.</p><h1>Gute Gespräche<br /><span>beginnen mit Übung.</span></h1><p className="intro-copy">Wählen Sie eine Situation aus Ihrem Makleralltag. Führen Sie das Gespräch. Üben Sie die Stelle, die den Unterschied macht.</p></div>
      <aside className="practice-note"><Headphones size={25} /><p className="eyebrow">Ein Durchlauf</p><strong>5 Minuten für<br />einen neuen Blickwinkel.</strong><ol><li><span>01</span>Situation kennenlernen</li><li><span>02</span>Frei mit der Person sprechen</li><li><span>03</span>Einen Moment besser lösen</li></ol></aside>
    </section>
    {!ready && <div className="connection-notice" role="status"><span><strong>Telefonverbindung noch nicht eingerichtet.</strong> Szenarien und Bedienung sind verfügbar. Für echte KI-Gespräche fehlt der serverseitige Zugang.</span><Link href="/werkstatt">Verbindung prüfen <ArrowUpRight size={16} /></Link></div>}
    {latest && <Link className="resume-strip" href={latest.status === "active" ? `/sitzung/${latest.id}` : `/sitzung/${latest.id}/auswertung`}><span><span className="eyebrow">Zuletzt geübt</span><strong>{latest.scenarioTitle}</strong></span><span>{latest.status === "active" ? "Gespräch fortsetzen" : "Auswertung ansehen"} <ArrowUpRight size={18} /></span></Link>}
    <section aria-labelledby="scenes-title"><div className="section-heading"><div><p className="eyebrow">Situationen aus der Praxis</p><h2 id="scenes-title">Welches Gespräch steht an?</h2></div><span className="count-label">8 Szenarien · Wiener Immobilienmarkt</span></div>
      <div className="scene-grid" data-testid="scene-stack">{frozenScenarios.map((scenario, index) => {
        const id = scenario.id as FrozenScenarioId;
        const card = toSceneCard({ id, title: scenario.title, counterpart: SCENARIO_COUNTERPARTS[id], blurb: SCENARIO_BLURBS[id], verticalId: "immobilien" });
        return card ? <SceneCard key={id} card={card} verticalId="immobilien" featured={index === 0} /> : null;
      })}</div>
    </section>
  </div>;
}
