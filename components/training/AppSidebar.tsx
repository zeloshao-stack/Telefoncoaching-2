"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AudioLines,
  History,
  Map,
  MessageCircle,
  PenLine,
  Phone,
  PhoneIncoming,
} from "lucide-react";
import { EngineBadge } from "@/components/training/EngineBadge";
import { VerticalSwitch } from "@/components/training/VerticalSwitch";
import { cn } from "@/lib/utils";
import type { VerticalId } from "@/lib/verticals";

type NavItem = {
  href?: string;
  label: string;
  icon: typeof Phone;
  later?: boolean;
  match?: (path: string) => boolean;
};

const UEBEN: NavItem[] = [
  {
    href: "/",
    label: "Üben",
    icon: Phone,
    match: (path) => path === "/" || path.startsWith("/szenario") || path.startsWith("/sitzung"),
  },
  {
    href: "/gespraeche",
    label: "Echte Gespräche",
    icon: PhoneIncoming,
  },
  {
    href: "/verlauf",
    label: "Verlauf",
    icon: History,
  },
];

const FRAGEN: NavItem[] = [
  {
    href: "/coach",
    label: "Vertriebscoach",
    icon: MessageCircle,
  },
];

const NAECHSTES: NavItem[] = [
  {
    href: "/autor",
    label: "Szenario schreiben",
    icon: PenLine,
  },
];

const SPAETER: NavItem[] = [
  { href: "/stimme", label: "Stimme", icon: AudioLines },
  { label: "Verhaltensprofil", icon: Map, later: true },
];

function NavList({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href
          ? item.match
            ? item.match(path)
            : path === item.href || path.startsWith(`${item.href}/`)
          : false;
        const className = cn(
          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition",
          item.later && "text-muted-foreground/70 cursor-default",
          !item.later && !active && "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
          active && "bg-background text-foreground shadow-sm ring-1 ring-border/70",
        );
        const body = (
          <>
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.later ? (
              <span className="text-[0.65rem] font-medium tracking-wide uppercase" aria-label="später">
                später
              </span>
            ) : null}
          </>
        );
        return (
          <li key={item.label}>
            {item.href && !item.later ? (
              <Link href={item.href} className={className}>
                {body}
              </Link>
            ) : (
              <span className={className}>{body}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function NavGroup({ title, items, path }: { title: string; items: NavItem[]; path: string }) {
  return (
    <div className="px-3">
      <p className="text-muted-foreground px-2 pb-1.5 pt-4 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
        {title}
      </p>
      <NavList items={items} path={path} />
    </div>
  );
}

function LaterGroup({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 pt-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-muted-foreground hover:text-foreground w-full cursor-pointer px-2 py-1.5 text-left text-[0.65rem] font-semibold tracking-[0.16em] uppercase"
        aria-expanded={open}
      >
        Später
      </button>
      {open ? <NavList items={SPAETER} path={path} /> : null}
    </div>
  );
}

export function AppSidebar({
  verticalId,
  onNavigate,
}: {
  verticalId: VerticalId;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // Pfad erst nach Mount — sonst Hydration-Mismatch Server/Client bei usePathname.
  const [path, setPath] = useState("/");
  useEffect(() => {
    setPath(pathname ?? "/");
  }, [pathname]);

  return (
    <aside
      className="border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-[0.7rem] font-semibold tracking-wide text-primary-foreground">
          TC
        </span>
        <span>
          <span className="font-heading block text-[1.15rem] leading-none tracking-tight">
            Telefoncoaching
          </span>
          <span className="text-muted-foreground text-[0.65rem] tracking-[0.14em] uppercase">
            KMU-Maklerbüros
          </span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto pb-4" onClick={onNavigate}>
        <NavGroup title="Sofort" items={UEBEN} path={path} />
        <NavGroup title="Fragen" items={FRAGEN} path={path} />
        <NavGroup title="Als Nächstes" items={NAECHSTES} path={path} />
        <LaterGroup path={path} />
      </nav>

      <div className="border-sidebar-border mt-auto space-y-4 border-t px-4 py-4">
        <VerticalSwitch activeId={verticalId} />
        <p className="text-muted-foreground">
          <EngineBadge compact />
        </p>
      </div>
    </aside>
  );
}
