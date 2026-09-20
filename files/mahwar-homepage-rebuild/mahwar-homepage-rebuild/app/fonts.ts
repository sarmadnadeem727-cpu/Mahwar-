/**
 * Font loading via next/font — merge into the project's app/layout.tsx.
 * Exposes CSS variables the Tailwind font tokens read:
 *   --font-serif  Source Serif 4  (display headlines only)
 *   --font-sans   Inter           (body, UI)
 *   --font-mono   IBM Plex Mono   (every number, ticker, label, timestamp)
 */
import { IBM_Plex_Mono, Inter, Source_Serif_4 } from "next/font/google";

export const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal"],
  variable: "--font-serif",
  display: "swap",
});

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/** Add to the <body> (or <html>) className in app/layout.tsx */
export const fontClassNames = `${fontSerif.variable} ${fontSans.variable} ${fontMono.variable}`;
