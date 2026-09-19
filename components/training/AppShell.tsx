"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, History, MessageCircle, Settings2 } from "lucide-react";
import type { VerticalId } from "@/lib/verticals";
export function AppShell({ children }: { children: React.ReactNode; verticalId: VerticalId }) {
  const path = usePathname();
  const inCall = /^\/sitzung\/[^/]+$/.test(path);
  const navigation = [
    { href: "/", label: "Training", icon: Phone, active: path === "/" || path.startsWith("/szenario") },
    { href: "/verlauf", label: "Meine Gespräche", icon: History, active: path.startsWith("/verlauf") || path.includes("/auswertung") },
    { href: "/coach", label: "Vertriebscoach", icon: MessageCircle, active: path.startsWith("/coach") },
  ];
  return <div className={inCall ? "work-app call-mode" : "work-app"}>
    <a href="#main-content" className="skip-link">Zum Inhalt</a>
    <header className="work-header">
      <Link className="wordmark" href="/" aria-label="MANZL Telefontraining Startseite"><span className="brand-icon"><Phone size={18} /></span><span>MANZL<span className="wordmark-sub">TELEFONTRAINING</span></span></Link>
      {inCall ? <span className="call-header-label">Ihr Übungsgespräch</span> : <nav aria-label="Hauptnavigation">{navigation.map(({ href, label, icon: Icon, active }) => <Link href={href} key={href} aria-current={active ? "page" : undefined} className={active ? "nav-link active" : "nav-link"}><Icon size={17} /><span>{label}</span></Link>)}</nav>}
      {!inCall && <Link href="/werkstatt" className="settings-link" aria-label="Einstellungen und Werkstatt"><Settings2 size={19} /></Link>}
    </header>
    <main id="main-content" className={inCall ? "call-main" : "work-main"}>{children}</main>
    {!inCall && <footer className="work-footer"><span>MANZL · Einfach gute Gespräche.</span><span>Wien · Synthetische Trainingsfälle</span></footer>}
  </div>;
}
