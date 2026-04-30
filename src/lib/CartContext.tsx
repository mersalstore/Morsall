"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  vendor: string;
  vendorId?: string;
  image: string;
  size?: string;
  color?: string;
  variationId?: string;
  selectedOptions?: Record<string, string>;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variationId?: string) => void;
  updateQty: (id: string, delta: number, variationId?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("mersal_cart");
    if (savedCart) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("mersal_cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addItem = (item: CartItem) => {
    setCart(prev => {
      // Find item with same ID AND same variationId (if any)
      const existing = prev.find(i => 
        i.id === item.id && 
        i.variationId === item.variationId &&
        JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
      );
      
      if (existing) {
        return prev.map(i => 
          (i.id === item.id && i.variationId === item.variationId && JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions))
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string, variationId?: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.variationId === variationId)));
  };

  const updateQty = (id: string, delta: number, variationId?: string) => {
    setCart(prev => prev.map(i => 
      (i.id === id && i.variationId === variationId) ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
