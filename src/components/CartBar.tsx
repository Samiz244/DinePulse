import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './CartBar.css'

interface CartBarProps {
  restaurantSlug: string
}

export default function CartBar({ restaurantSlug: _ }: CartBarProps) {
  const { itemCount, total, submitOrder } = useCart()
  const [params]                          = useSearchParams()
  const [submitting, setSubmitting]       = useState(false)
  const [btnText, setBtnText]             = useState<string | null>(null)

  const tableNumber = params.get('table') ? parseInt(params.get('table')!, 10) : null

  if (itemCount === 0) return null

  async function handleOrder() {
    if (submitting) return
    setSubmitting(true)
    const { error } = await submitOrder(tableNumber)
    if (error) {
      setBtnText('Failed — tap to retry')
      setSubmitting(false)
      setTimeout(() => setBtnText(null), 3000)
    }
    // On success: CLEAR_CART fires → itemCount → 0 → CartBar unmounts
  }

  const label = submitting
    ? 'Placing order…'
    : (btnText ?? `Place Order · £${total.toFixed(2)}`)

  return (
    <div className="cart-bar">
      <div className="cart-bar-inner">
        <span className="cart-bar-count">{itemCount}</span>
        <button
          className="cart-bar-cta"
          onClick={handleOrder}
          disabled={submitting}
        >
          {label}
        </button>
      </div>
    </div>
  )
}
