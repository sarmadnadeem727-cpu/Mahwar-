import { footerNav } from "../../lib/sample-data";
import { Container } from "../ui/Container";

const year = 2026;

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-1">
      <Container className="grid gap-10 py-14 lg:grid-cols-12">
        {/* Brand mark */}
        <div className="lg:col-span-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-heading text-ink-900">Mahwar</span>
            <span lang="ar" dir="rtl" className="font-serif text-heading text-ink-900">
              محور
            </span>
          </div>
          <p className="mt-2 font-mono text-mono-xs text-ink-500">The axis of intelligence</p>
          <p className="mt-4 max-w-xs text-caption text-ink-700">
            Financial and supply chain intelligence for Gulf capital markets, in Arabic and English.
          </p>
        </div>

        {/* Nav groups */}
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
          {footerNav.map((group) => (
            <div key={group.heading}>
              <h2 className="text-caption font-medium text-ink-900">{group.heading}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-caption text-ink-700 underline-offset-4 hover:text-ink-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-4 font-mono text-mono-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Mahwar · A product of Zener Inc. All rights reserved.</span>
          <span>AR · EN</span>
        </Container>
      </div>
    </footer>
  );
}
