import type { Metadata, Viewport } from "next"
import { Noto_Sans } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import "./globals.css"

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: {
    default: "The Dream Census",
    template: "%s | Dream Census",
  },
  description: "Explore our collective relationship with dreams. Share your dream experiences and join a communal exploration of the dreaming mind.",
  keywords: ["dreams", "dream journal", "dream survey", "lucid dreaming", "sleep", "consciousness"],
  authors: [{ name: "Dream Census" }],
  openGraph: {
    title: "The Dream Census",
    description: "Tell us about your dreams...",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e1a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${notoSans.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
