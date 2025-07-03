import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/context/session-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { StoreNotice } from "@/components/store-notice"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DropsKey",
  description:
    "DropsKey is your one-stop shop for digital keys and software licenses. We offer a wide range of products at competitive prices, with instant delivery and top-notch customer support.",
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
          <SessionProvider>
            <StoreNotice />
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </SessionProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}