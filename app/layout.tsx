import type { Metadata } from "next";
import { AppShell } from "@/components/training/AppShell";
import { activeVertical } from "@/lib/workspace";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANZL · Telefontraining",
  icons: { icon: "/training-icon.svg" },
  description:
    "Gesprächstraining für kleine und mittlere Maklerbüros: Üben, auswerten, dieselbe Stelle wiederholen.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const vertical = await activeVertical();
  return (
    <html
      lang={vertical.locale}
      className="h-full antialiased"
    >
      <body className="app-canvas min-h-full font-sans text-foreground">
        <AppShell verticalId={vertical.id}>{children}</AppShell>
      </body>
    </html>
  );
}
