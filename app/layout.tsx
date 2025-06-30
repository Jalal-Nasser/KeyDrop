import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { StoreNotice } from "@/components/store-notice"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Dropskey",
  description: "Verified Digital Key Store",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <StoreNotice />
        {children}
        <Footer />
      </body>
    </html>
  )
}
