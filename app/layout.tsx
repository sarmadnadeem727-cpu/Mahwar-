import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/ui/LoadingScreen";
import QueryProvider from "@/components/providers/QueryProvider";
import { UserProvider } from "@/components/providers/UserProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["400", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahwar | محور - Saudi Capital Markets Intelligence",
  description: "The Axis of financial intelligence for Saudi capital markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} ${cormorant.variable}`}>
      <body className="bg-[var(--void)] text-[var(--text1)] min-h-screen">
        <QueryProvider>
          <UserProvider>
            <LoadingScreen />
            {children}
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
