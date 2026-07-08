"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { docsNav, getDocsNeighbors } from "@/lib/docs-nav"
import { cn } from "@/lib/utils"

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { prev, next } = getDocsNeighbors(pathname)

  return (
    <div className="bg-[#fafafa] border-t-2 border-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[240px_1fr] min-h-[70vh]">
          {/* Sidebar */}
          <aside className="lg:border-r-2 border-black py-8 lg:pr-6 lg:sticky lg:top-14 lg:self-start lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
            <div className="mb-6 lg:mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Documentation
              </p>
              <p className="font-display text-2xl text-black mt-1">Splitpot</p>
            </div>

            <nav className="space-y-6" aria-label="Docs">
              {docsNav.map((section) => (
                <div key={section.title}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">
                    {section.title}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block border-l-2 pl-3 py-1.5 text-sm transition-colors",
                              active
                                ? "border-black text-black font-medium"
                                : "border-transparent text-neutral-600 hover:border-neutral-400 hover:text-black"
                            )}
                          >
                            {item.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t-2 border-black hidden lg:block">
              <Link
                href="/app"
                className="font-mono text-[11px] uppercase tracking-wider text-black underline underline-offset-4"
              >
                Open app →
              </Link>
            </div>
          </aside>

          {/* Content */}
          <div className="py-8 lg:pl-10 lg:py-10 min-w-0">
            <article className="max-w-2xl">{children}</article>

            {(prev || next) && (
              <nav
                className="max-w-2xl mt-14 pt-8 border-t-2 border-black grid sm:grid-cols-2 gap-4"
                aria-label="Docs pagination"
              >
                {prev ? (
                  <Link
                    href={prev.href}
                    className="proof-card-flat p-4 hover:bg-neutral-50 block"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      Previous
                    </p>
                    <p className="font-display text-xl text-black mt-1">{prev.title}</p>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link
                    href={next.href}
                    className="proof-card-flat p-4 hover:bg-neutral-50 block sm:text-right"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      Next
                    </p>
                    <p className="font-display text-xl text-black mt-1">{next.title}</p>
                  </Link>
                ) : null}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
