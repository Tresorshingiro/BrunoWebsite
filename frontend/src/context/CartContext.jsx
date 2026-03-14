import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

function loadCart() {
  try {
    const saved = localStorage.getItem('cart')
    const parsed = saved ? JSON.parse(saved) : null
    return Array.isArray(parsed?.items) ? parsed : { items: [] }
  } catch {
    return { items: [] }
  }
}


function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { book, quantity = 1, format = 'physical' } = action.payload
      const key = `${book._id}-${format}`
      const existing = state.items.find((i) => `${i.book._id}-${i.format}` === key)
      let items
      if (existing) {
        items = state.items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        )
      } else {
        items = [...state.items, { book, quantity, format }]
      }
      return { items }
    }
    case 'REMOVE':
      return {
        items: state.items.filter(
          (i) => !(i.book._id === action.payload.id && i.format === action.payload.format)
        ),
      }
    case 'SET_QUANTITY': {
      const { id, format, quantity } = action.payload
      if (quantity < 1) {
        return { items: state.items.filter((i) => !(i.book._id === id && i.format === format)) }
      }
      return {
        items: state.items.map((i) =>
          i.book._id === id && i.format === format ? { ...i, quantity } : i
        ),
      }
    }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state))
  }, [state])

  const addItem = useCallback((book, quantity = 1, format = 'physical') => {
    dispatch({ type: 'ADD', payload: { book, quantity, format } })
  }, [])

  const removeItem = useCallback((id, format) => {
    dispatch({ type: 'REMOVE', payload: { id, format } })
  }, [])

  const setQuantity = useCallback((id, format, quantity) => {
    dispatch({ type: 'SET_QUANTITY', payload: { id, format, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0)
  const totalAmount = state.items.reduce((s, i) => {
    const price = i.format === 'digital' ? (i.book.digitalPrice ?? i.book.price) : i.book.price
    return s + (price || 0) * i.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        setQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
