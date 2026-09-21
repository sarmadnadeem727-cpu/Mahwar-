import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, IBM_Plex_Mono, Cairo } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { APP } from "@/lib/registry";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
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
      className={`${cormorant.variable} ${dmSans.variable} ${plexMono.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-1 text-fg min-h-screen antialiased">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}

