'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import { MobileNavBar } from "@/components/mobile-nav-bar"
import { HashAuthRedirect } from "@/components/hash-auth-redirect"
import { Footer } from "@/components/footer"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] pt-16">
          {children}
        </main>
        <MobileNavBar />
        <Footer />
        <Toaster position="top-center" />
        <HashAuthRedirect />
      </AuthProvider>
    </ThemeProvider>
  )
}
