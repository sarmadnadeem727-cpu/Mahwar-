/** Tiny class joiner — avoids adding clsx/tailwind-merge as dependencies. */
export function cn(...parts: ReadonlyArray<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
