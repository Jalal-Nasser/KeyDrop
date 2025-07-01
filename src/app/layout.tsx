import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { StoreNotice } from "@/components/store-notice"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dropskey - Authorized Digital Key Store",
  description: "Authorized Digital Key Store for Windows, Office, and software licenses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreNotice />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}