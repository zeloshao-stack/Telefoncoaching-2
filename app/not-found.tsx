import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass-card mx-auto max-w-lg rounded-3xl border p-10 text-center">
      <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Nicht gefunden</p>
      <h1 className="font-heading mt-3 text-3xl">Diese Seite gibt es nicht</h1>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        Das Szenario oder die Sitzung ist unbekannt. Wählen Sie einen der drei freigegebenen Fälle.
      </p>
      <Link href="/" className="text-primary mt-6 inline-block text-sm underline">
        Zur Fallübersicht
      </Link>
    </div>
  );
}
