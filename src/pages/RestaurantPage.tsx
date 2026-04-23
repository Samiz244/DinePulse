import { useParams } from 'react-router-dom'
import { usePublicMenu } from '../hooks/usePublicMenu'
import { CartProvider, useCart } from '../context/CartContext'
import CartBar from '../components/CartBar'
import type { CartItem } from '../types'

// ── Add-to-cart button — must be a child of CartProvider ────────
function AddButton({ restaurantId, item }: {
  restaurantId: string
  item:         Omit<CartItem, 'quantity'>
}) {
  const { addItem } = useCart()
  return (
    <button
      className="w-7 h-7 rounded-full bg-[#FF5722] text-white text-lg font-bold flex items-center justify-center leading-none hover:bg-[#E64A19] active:scale-95 transition-all shrink-0"
      onClick={() => addItem(restaurantId, item)}
      aria-label={`Add ${item.name}`}
    >
      +
    </button>
  )
}

// ── Inner page — has access to CartContext ──────────────────────
function RestaurantPageContent({ slug }: { slug: string }) {
  const { restaurant, groupedMenu, isLoading, notFound } = usePublicMenu(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-sm text-[#757575]">Loading menu…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl mb-4">🍽️</p>
        <h1 className="text-xl font-bold text-[#212121] mb-2">Restaurant Not Found</h1>
        <p className="text-sm text-[#757575] mb-6 max-w-xs">
          We couldn't find that restaurant. It may have moved or been removed.
        </p>
        <a href="/"
          className="text-sm font-medium text-[#FF5722] border border-[#FF5722] rounded-full px-5 py-2 hover:bg-[#FF5722] hover:text-white transition-colors">
          Go to home →
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-28">

      {/* Page header */}
      <header className="bg-white shadow-sm px-4 py-5">
        <div className="max-w-lg mx-auto">
          <span className="text-2xl font-bold tracking-tight text-[#FF5722]">DinePulse</span>
          <div className="mt-3">
            <h1 className="text-xl font-bold text-[#212121]">{restaurant!.name}</h1>
            {restaurant!.cuisine_type && (
              <p className="text-sm text-[#757575] mt-0.5">{restaurant!.cuisine_type}</p>
            )}
          </div>
        </div>
      </header>

      {/* Menu sections */}
      <main className="max-w-lg mx-auto px-4 pt-6 space-y-8">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-base font-semibold text-[#212121] mb-3">{category}</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id}
                  className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#212121]">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-[#757575] mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold text-[#FF5722]">
                      £{parseFloat(String(item.price)).toFixed(2)}
                    </span>
                    <AddButton
                      restaurantId={restaurant!.id}
                      item={{ id: item.id, name: item.name, price: item.price }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {Object.keys(groupedMenu).length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="text-sm font-medium text-[#212121]">No menu items yet</p>
          </div>
        )}
      </main>

      <CartBar restaurantSlug={slug} />
    </div>
  )
}

// ── Route component — owns CartProvider ────────────────────────
export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <CartProvider>
      <RestaurantPageContent slug={slug ?? ''} />
    </CartProvider>
  )
}
