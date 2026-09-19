import type { Spotlight } from "@/lib/spotlight";
import { cn } from "@/lib/utils";

export function SpotlightBlocks({
  recap,
  lever,
  quote,
  nextStep,
  phrase,
  quoteSpeaker,
  compact = false,
}: Spotlight & { quoteSpeaker?: string; compact?: boolean }) {
  const body = compact ? "text-sm leading-relaxed" : "text-base leading-relaxed";
  return (
    <div className={cn(compact ? "space-y-4" : "space-y-7")}>
      <section>
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Recap</p>
        <p className={cn("mt-2", body)}>{recap}</p>
      </section>
      <section>
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Hebel</p>
        {quote ? (
          <blockquote className={cn("border-copper/50 mt-2 border-l-2 pl-4", body)}>
            „{quote}“
            {quoteSpeaker ? (
              <footer className="text-muted-foreground mt-2 text-xs">{quoteSpeaker}</footer>
            ) : null}
          </blockquote>
        ) : null}
        <p className={cn("mt-2", body)}>{lever}</p>
      </section>
      <section>
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Next Step</p>
        <p className={cn("mt-2", body)}>{nextStep}</p>
      </section>
      {phrase ? (
        <section>
          <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Formulierung</p>
          <p className={cn("mt-2", body)}>„{phrase}“</p>
        </section>
      ) : null}
    </div>
  );
}
