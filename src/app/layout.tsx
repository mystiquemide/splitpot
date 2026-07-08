import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"
import { ToastProvider } from "@/components/ui/toast"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Splitpot — matchday pots, self-custodial",
  description:
    "Football watch-party prediction pots with equal stakes. Self-custodial wallets via Tether WDK. No custodian, no cloud AI.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-gray-950 text-gray-100 flex flex-col font-sans">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  )
}
