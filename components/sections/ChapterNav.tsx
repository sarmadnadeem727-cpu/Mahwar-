"use client";

import React, { useEffect, useState } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { FLAGSHIPS } from "@/lib/registry";
import { CHAPTERS, chapterHref } from "@/components/sections/chapters";

/**
 * ChapterNav — the sticky rail that tracks which chapter is on screen.
 *
 * One IntersectionObserver watches every `[data-chapter]` section (and the six
 * `[data-flagship]` sub-sections). The chapter whose centre band is most
 * visible wins; no scroll listeners, no layout thrash. Desktop: a rail of
 * chapter codes on the trailing edge (right in LTR, left in RTL). Mobile: a
 * slim dot strip pinned to the bottom, never overlapping the copy.
 */
export default function ChapterNav() {
  const language = useTerminalStore((s) => s.language);
  const isAr = language === "ar";
  const [active, setActive] = useState<string>(CHAPTERS[0].id);
  const [flagship, setFlagship] = useState<string | null>(null);

  useEffect(() => {
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const demos = Array.from(document.querySelectorAll<HTMLElement>("[data-flagship]"));
    if (!chapters.length || typeof IntersectionObserver === "undefined") return;

    // The chapter (and flagship sub-section) that contains the vertical
    // midpoint of the viewport is the active one. The observer is only the
    // trigger — it fires as sections cross its thresholds — so there is no
    // scroll listener and no per-frame work.
    const pick = (els: HTMLElement[], key: "chapter" | "flagship") => {
      const mid = window.innerHeight / 2;
      const hit = els.find((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
      return hit ? hit.dataset[key] ?? null : null;
    };
    const update = () => {
      setActive(pick(chapters, "chapter") ?? CHAPTERS[0].id);
      setFlagship(pick(demos, "flagship"));
    };
    const io = new IntersectionObserver(update, { threshold: Array.from({ length: 41 }, (_, i) => i / 40) });
    update();
    [...chapters, ...demos].forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", chapterHref(id));
  };

  return (
    <>
      {/* Desktop rail */}
      <nav
        className={`chapter-rail ${isAr ? "left-5" : "right-5"}`}
        aria-label={isAr ? "فصول الصفحة" : "Page chapters"}
        dir="ltr"
      >
        {CHAPTERS.map((c) => {
          const isActive = active === c.id;
          return (
            <React.Fragment key={c.id}>
              <a
                href={chapterHref(c.id)}
                onClick={(e) => jump(e, c.id)}
                className={`chapter-rail__item ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "location" : undefined}
              >
                <span className="chapter-rail__tick" />
                <span>{c.code}</span>
              </a>
              {c.id === "flagship" && isActive && (
                <div className="mb-1">
                  {FLAGSHIPS.map((f) => (
                    <a
                      key={f.id}
                      href={`#flagship-${f.id}`}
                      onClick={(e) => jump(e, `flagship-${f.id}`)}
                      className={`chapter-rail__sub block flagship flagship-${f.id === "monte_carlo" ? "mc" : f.id === "zscore" ? "z" : f.id.toLowerCase()} ${flagship === f.id ? "is-active" : ""}`}
                    >
                      {f.code}
                    </a>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile dot strip */}
      <nav className="chapter-dots" aria-label={isAr ? "فصول الصفحة" : "Page chapters"} dir="ltr">
        {CHAPTERS.map((c) => (
          <a
            key={c.id}
            href={chapterHref(c.id)}
            onClick={(e) => jump(e, c.id)}
            className={`chapter-dots__dot ${active === c.id ? "is-active" : ""}`}
            aria-label={c.code}
            aria-current={active === c.id ? "location" : undefined}
          />
        ))}
      </nav>
    </>
  );
}
