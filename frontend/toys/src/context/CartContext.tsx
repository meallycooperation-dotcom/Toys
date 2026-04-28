import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type CartItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
  stock: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'toys_cart'

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as CartItem[]
  } catch (error) {
    console.warn('Failed to load cart from localStorage', error)
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.warn('Failed to save cart to localStorage', error)
    }
  }, [items])

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === newItem.product_id)
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === newItem.product_id
            ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.stock) }
            : item
        )
      }
      
      return [...prevItems, newItem]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product_id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
