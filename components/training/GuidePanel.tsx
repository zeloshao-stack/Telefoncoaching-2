"use client";

import type { CallGuide } from "@/lib/authored-types";

export function GuidePanel({
  guide,
  onChange,
}: {
  guide: CallGuide;
  onChange?: (guide: CallGuide) => void;
}) {
  const editable = Boolean(onChange);

  function setField<K extends "occasion" | "presumed">(key: K, value: string) {
    onChange?.({ ...guide, [key]: value });
  }

  function setList(key: "lines" | "avoid" | "questions", value: string) {
    onChange?.({ ...guide, [key]: value.split("\n").map((line) => line.trimEnd()) });
  }

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[1.7rem] border p-6">
      <div>
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Leitfaden · Orientierung</p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Für die Vorbereitung. Die Gegenseite sieht das nicht. Kein Ablesen im Call.
        </p>
      </div>
      <GuideBlock title="Anlass und Ziel" value={guide.occasion} editable={editable} onChange={(v) => setField("occasion", v)} />
      <GuideBlock
        title="Vermutete Lage"
        value={guide.presumed}
        editable={editable}
        onChange={(v) => setField("presumed", v)}
      />
      <GuideBlock
        title="Satzfamilien"
        value={guide.lines.join("\n")}
        editable={editable}
        onChange={(v) => setList("lines", v)}
      />
      <GuideBlock title="Nicht tun" value={guide.avoid.join("\n")} editable={editable} onChange={(v) => setList("avoid", v)} />
      <GuideBlock
        title="Diagnosefragen"
        value={guide.questions.join("\n")}
        editable={editable}
        onChange={(v) => setList("questions", v)}
      />
    </section>
  );
}

function GuideBlock({
  title,
  value,
  editable,
  onChange,
}: {
  title: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
}) {
  if (editable) {
    return (
      <label className="text-xs font-medium">
        {title}
        <textarea
          className="mt-1 min-h-20 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide uppercase">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{value}</p>
    </div>
  );
}
