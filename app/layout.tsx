import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] });

import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
  
      <html lang="en">
        <body className={inter.className}>
        {children}
        <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
