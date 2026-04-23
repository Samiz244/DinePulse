import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import { supabase } from '../services/supabaseClient'
import type { CartItem, CartState } from '../types'

// ── Action types ────────────────────────────────────────────────
type CartAction =
  | { type: 'ADD_ITEM';        restaurantId: string; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM';     id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }

// ── Context value ───────────────────────────────────────────────
interface CartContextValue {
  state:      CartState
  itemCount:  number
  total:      number
  addItem:    (restaurantId: string, item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty:  (id: string, quantity: number) => void
  clearCart:   () => void
  submitOrder: (tableNumber: number | null) => Promise<{ orderId: string | null; error: string | null }>
}

const CartContext = createContext<CartContextValue | null>(null)

// ── Reducer ─────────────────────────────────────────────────────
const DEFAULT_STATE: CartState = { restaurantId: null, items: [] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case 'ADD_ITEM': {
      // Isolation: different restaurant → wipe old cart, start fresh
      if (state.restaurantId !== null && state.restaurantId !== action.restaurantId) {
        return {
          restaurantId: action.restaurantId,
          items: [{ ...action.item, quantity: 1 }],
        }
      }
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return {
          restaurantId: action.restaurantId,
          items: state.items.map(i =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        restaurantId: action.restaurantId,
        items: [...state.items, { ...action.item, quantity: 1 }],
      }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      }
    }

    case 'CLEAR_CART':
      return DEFAULT_STATE
  }
}

// ── localStorage helpers ────────────────────────────────────────
const STORAGE_KEY = 'dp_cart'

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as CartState
    if (!Array.isArray(parsed.items)) return DEFAULT_STATE
    return parsed
  } catch {
    return DEFAULT_STATE
  }
}

// ── Provider ────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  // loadFromStorage passed as init fn — called exactly once on mount
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
  const total     = state.items.reduce((n, i) => n + i.price * i.quantity, 0)

  const addItem    = (restaurantId: string, item: Omit<CartItem, 'quantity'>) =>
    dispatch({ type: 'ADD_ITEM', restaurantId, item })
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', id })
  const updateQty  = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  async function submitOrder(
    tableNumber: number | null
  ): Promise<{ orderId: string | null; error: string | null }> {
    if (!state.restaurantId || state.items.length === 0) {
      return { orderId: null, error: 'Cart is empty.' }
    }

    const { data: orderId, error } = await supabase.rpc('insert_order', {
      p_restaurant_id: state.restaurantId,
      p_table_number:  tableNumber,
      p_items: state.items.map(i => ({
        menu_item_id:  i.id,
        name:          i.name,
        quantity:      i.quantity,
        price_at_time: i.price,
      })),
    })

    if (error) return { orderId: null, error: 'Failed to place order. Please try again.' }

    dispatch({ type: 'CLEAR_CART' })
    return { orderId: orderId as string, error: null }
  }

  return (
    <CartContext.Provider value={{ state, itemCount, total, addItem, removeItem, updateQty, clearCart, submitOrder }}>
      {children}
    </CartContext.Provider>
  )
}

// ── Hook ────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
