import type { Metadata } from "next"
import { Instrument_Serif, IBM_Plex_Mono, Inter } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"
import { ToastProvider } from "@/components/ui/toast"

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Splitpot — matchday pots, self-custodial",
  description:
    "Football watch-party prediction pots with equal stakes. Self-custodial wallets via Tether WDK. No custodian, no cloud AI.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${body.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] flex flex-col antialiased">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  )
}
