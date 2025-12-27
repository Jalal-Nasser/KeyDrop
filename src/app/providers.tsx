"use client"

import { CartProvider } from "@/context/cart-context"
import { SessionProvider } from "@/context/session-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { PayPalProvider } from "@/context/paypal-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PayPalProvider>
            <SessionProvider>
                <WishlistProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </WishlistProvider>
            </SessionProvider>
        </PayPalProvider>
    )
}
