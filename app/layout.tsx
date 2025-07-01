import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreNotice } from "@/components/store-notice"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dropskey",
  description: "Verified Digital Key Store",
  icons: {
    icon: "/favicon.png", // Pointing to the favicon.png in the public directory
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreNotice />
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}