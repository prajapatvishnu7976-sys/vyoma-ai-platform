import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/chakra-petch/700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "VYOMA — Ask the sky in your own words · SIH 2026",
  description:
    "An agentic vision-language assistant for multimodal remote sensing image analysis. Ask plain-language questions about satellite imagery and get evidence-backed answers with auditable execution traces. Smart India Hackathon 2026 · ISRO PS 26167 (SatQuery AI).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-void text-ink">
        {children}
        <div className="noise-layer" aria-hidden />
        <div className="vignette" aria-hidden />
      </body>
    </html>
  );
}
