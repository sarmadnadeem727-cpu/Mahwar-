/**
 * The landing page is a scroll-driven book: seven chapters, each a `<section
 * data-chapter="…">`. ChapterNav reads this list, the Navbar links to it, and
 * every section id comes from here so an anchor can never go stale.
 */
export interface Chapter {
  id: string;
  code: string;
  en: string;
  ar: string;
  /** Light-inverted chapters break the dark rhythm (INTRO→ENGINES, NETWORK→TRUST). */
  tone: "dark" | "light";
}

export const CHAPTERS: Chapter[] = [
  { id: "intro", code: "INTRO", en: "Intro", ar: "المقدمة", tone: "dark" },
  { id: "engines", code: "ENGINES", en: "Engines", ar: "المحركات", tone: "light" },
  { id: "flagship", code: "FLAGSHIP", en: "Flagship", ar: "الرئيسية", tone: "dark" },
  { id: "network", code: "NETWORK", en: "Network", ar: "الشبكة", tone: "dark" },
  { id: "trust", code: "TRUST", en: "Trust", ar: "الثقة", tone: "light" },
  { id: "wire", code: "WIRE", en: "Wire", ar: "الأخبار", tone: "dark" },
  { id: "start", code: "START", en: "Start", ar: "ابدأ", tone: "dark" },
];

export const chapterHref = (id: string) => `#${id}`;
