import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"

import { Providers } from "./providers"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "DropsKey",
    description:
        "DropsKey is your one-stop shop for digital keys and software licenses. We offer top-quality products at competitive prices, with instant delivery and top-notch customer support.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Providers>
                        <div className="flex min-h-screen flex-col">
                            <Header />
                            <main className="flex-grow">{children}</main>
                            <Footer />
                        </div>
                        <Toaster />
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
