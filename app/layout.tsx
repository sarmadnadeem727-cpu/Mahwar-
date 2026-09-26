import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/ui/LoadingScreen";
import CursorGlow from "@/components/ui/CursorGlow";
import ThemeProvider from "@/components/ui/ThemeProvider";
import AppleShortcutsHUD from "@/components/ui/AppleShortcutsHUD";
import Toasts from "@/components/ui/Toasts";
import { APP } from "@/lib/registry";

/**
 * Typography — three faces, each carrying both scripts:
 *   IBM Plex Sans Arabic  body & UI   (full Latin + Arabic, one rhythm for EN and AR)
 *   Readex Pro            headlines   (designed for Arabic + Latin, wide and legible)
 *   IBM Plex Mono         numbers     (tabular figures everywhere)
 * The Arabic and Latin glyphs of each face are drawn together, so switching
 * language never changes the typeface, only the direction.
 */
const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP.url),
  title: `${APP.name} (${APP.nameAr}) — Finance & Supply Chain Intelligence Terminal`,
  description:
    "The axis where capital meets logistics. Institutional DCF, LBO and 3-statement modelling, AAOIFI screening, a live GCC stock screener and a full supply-chain analytics suite.",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
  openGraph: {
    title: `${APP.name} (${APP.nameAr}) — Finance & Supply Chain Terminal`,
    description: "Bloomberg-grade modelling for GCC capital markets and operations, in one terminal.",
    url: APP.url,
    siteName: APP.name,
    locale: "en_US",
    type: "website",
    images: ["/logo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#071522" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plexSansArabic.variable} ${readexPro.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-1 text-fg min-h-screen antialiased">
        <ThemeProvider>
          <LoadingScreen />
          <CursorGlow />
          <Toasts />
          <AppleShortcutsHUD />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
