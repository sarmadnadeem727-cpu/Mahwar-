import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Inter, IBM_Plex_Mono, Cairo } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/ui/LoadingScreen";
import CursorGlow from "@/components/ui/CursorGlow";
import { APP } from "@/lib/registry";

// Typography: Source Serif 4 for headlines, Inter for body, IBM Plex Mono for
// every number, Cairo for Arabic. No fifth typeface anywhere.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP.url),
  title: `${APP.name} (${APP.nameAr}) — Finance & Supply Chain Intelligence Terminal`,
  description:
    "The axis where capital meets logistics. Institutional DCF, LBO and 3-statement modelling, AAOIFI screening, and a full supply-chain analytics suite for GCC markets.",
  openGraph: {
    title: `${APP.name} (${APP.nameAr}) — Finance & Supply Chain Terminal`,
    description: "Bloomberg-grade modelling for GCC capital markets and operations, in one terminal.",
    url: APP.url,
    siteName: APP.name,
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090f12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} ${plexMono.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-1 text-fg min-h-screen antialiased">
        <LoadingScreen />
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}

