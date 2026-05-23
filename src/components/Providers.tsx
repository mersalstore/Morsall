"use client"

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import { NotificationProvider } from "@/lib/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}
