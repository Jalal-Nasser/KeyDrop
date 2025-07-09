import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/context/session-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { PayPalProvider } from "@/context/paypal-provider"
import { CartProvider } from "@/context/cart-context"
import { MobileNavBar } from "@/components/mobile-nav-bar" // Import the new component
import { WishlistProvider } from "@/context/wishlist-context" // Import WishlistProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DropsKey",
  description:
    "DropsKey is your one-stop shop for digital keys and software licenses. We offer a wide range of products at competitive prices, with instant delivery and top-notch customer support.",
  icons: {
    icon: '/panda.png', // Updated to panda.png
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
          <PayPalProvider>
            <SessionProvider>
              <CartProvider>
                <WishlistProvider> {/* Wrap with WishlistProvider */}
                  <Header />
                  <main className="flex-grow pb-[60px]">{children}</main> {/* Added padding-bottom */}
                  <Footer />
                  <MobileNavBar /> {/* Add the mobile navigation bar here */}
                </WishlistProvider>
              </CartProvider>
            </SessionProvider>
          </PayPalProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}