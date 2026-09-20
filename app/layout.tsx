import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Cairo, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/ui/LoadingScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
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

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahwar (محور) — Sovereign Financial Intelligence Terminal | GCC Capital Markets",
  description: "The Axis of financial intelligence for GCC capital markets. Institutional 5-year DCF valuation, LBO deal builder, AAOIFI Shariah screening, Monte Carlo Risk Engine, and 3-Statement Model.",
  openGraph: {
    title: "Mahwar (محور) — Sovereign Intelligence Terminal",
    description: "GCC Capital Markets Financial Intelligence, Institutional Valuation, AAOIFI Compliance & BI Reporting.",
    url: "https://mahwar.vercel.app",
    siteName: "Mahwar",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} ${cairo.variable} ${sourceSerif.variable}`}>
      <body className="bg-[#FFFFFF] text-[#171717] min-h-screen">
          <LoadingScreen />
          {children}
      </body>
    </html>
  );
}
