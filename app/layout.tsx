import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { fontClassNames } from "./fonts";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["400", "600", "700"],
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
    <html lang="en" className={`${fontClassNames} ${cairo.variable}`}>
      <body className="bg-[#FFFFFF] text-[#171717] min-h-screen">
          <LoadingScreen />
          {children}
      </body>
    </html>
  );
}
