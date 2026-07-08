import type { ReactNode } from "react"

export function DocsPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string
  title: string
  lead?: string
  children: ReactNode
}) {
  return (
    <>
      <header className="mb-10 border-b-2 border-black pb-8">
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl text-black leading-[1.05]">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
            {lead}
          </p>
        )}
      </header>
      <div className="docs-prose space-y-8 text-[15px] leading-relaxed text-neutral-700">
        {children}
      </div>
    </>
  )
}

export function DocsH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-2xl sm:text-3xl text-black leading-tight pt-2">
      {children}
    </h2>
  )
}

export function DocsH3({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-xl text-black leading-tight">{children}</h3>
}

export function DocsP({ children }: { children: ReactNode }) {
  return <p className="text-neutral-700 leading-relaxed">{children}</p>
}

export function DocsUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 text-neutral-700">{children}</ul>
}

export function DocsOl({ children }: { children: ReactNode }) {
  return <ol className="list-decimal pl-5 space-y-2 text-neutral-700">{children}</ol>
}

export function DocsNote({ children }: { children: ReactNode }) {
  return (
    <aside className="border-2 border-black bg-neutral-100 p-4 text-sm text-neutral-800 leading-relaxed">
      {children}
    </aside>
  )
}

export function DocsWarn({ children }: { children: ReactNode }) {
  return (
    <aside className="border-2 border-black bg-black text-white p-4 text-sm leading-relaxed">
      {children}
    </aside>
  )
}

export function DocsCode({ children }: { children: ReactNode }) {
  return (
    <pre className="border-2 border-black bg-white p-4 overflow-x-auto font-mono text-xs text-black leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

export function DocsTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="border-2 border-black overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-black text-white font-mono text-[10px] uppercase tracking-wider">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t-2 border-black">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-neutral-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      className="text-black underline underline-offset-4 decoration-1 hover:decoration-2"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  )
}
