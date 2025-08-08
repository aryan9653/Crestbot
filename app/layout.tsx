import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Sora } from 'next/font/google'
import "./globals.css"
import "./typography.css"

export const metadata: Metadata = {
  title: "Crest Trade Bot",
  description: "Multi-asset trading dashboard for Crypto and Indian Markets",
  generator: "v0.dev",
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })
const sora = Sora({ subsets: ["latin"], variable: "--font-display" })

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${sora.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
