"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Live theme. `next-themes` toggles `.light` / `.dark` on <html>; every colour
 * in the app is a CSS variable declared under those classes (app/globals.css),
 * so the whole terminal re-skins instantly, with no reload and no flash.
 * The default is the logo theme (light); "system" follows the OS.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false} storageKey="mahwar-theme">
      {children}
    </NextThemesProvider>
  );
}
