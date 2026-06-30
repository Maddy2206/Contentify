import type { Metadata } from "next"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Providers from "./_components/Providers"

export const metadata: Metadata = {
  title: "Contentify — One source in. A week of content out.",
  description:
    "Turn any article, idea, or transcript into platform-native content for LinkedIn, Twitter, Instagram, Bluesky and more.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <body>
          <Providers>{children}</Providers>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
