import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMenuItems } from '../hooks/useMenuItems'
import AddItemModal from './AddItemModal'

export default function MenuDashboard({ restaurant }) {
  const { signOut } = useAuth()
  const { items, isLoading, refetch } = useMenuItems(restaurant.id)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold tracking-tight text-[#FF5722]">{restaurant.name}</span>
          <span className="ml-2 text-sm text-[#757575]">{restaurant.cuisine_type}</span>
        </div>
        <button onClick={signOut}
          className="text-sm font-medium text-[#FF5722] border border-[#FF5722] rounded-full px-4 py-1.5 hover:bg-[#FF5722] hover:text-white transition-colors">
          Sign out
        </button>
      </header>

      <main className="px-4 pt-6 pb-24 max-w-lg mx-auto">

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#212121]">Your Menu</h2>
          <button onClick={() => setModalOpen(true)}
            className="bg-[#FF5722] text-white text-sm font-semibold rounded-full px-4 py-1.5 hover:bg-[#E64A19] active:scale-95 transition-all">
            + Add Item
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <p className="text-sm text-[#757575] text-center py-12">Loading menu…</p>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="text-sm font-medium text-[#212121]">No items yet</p>
            <p className="text-xs text-[#757575] mt-1">Add your first menu item to get started.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}
                className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#212121] truncate">{item.name}</p>
                  <p className="text-xs text-[#757575] mt-0.5">{item.category}</p>
                  {item.description && (
                    <p className="text-xs text-[#BDBDBD] mt-0.5 truncate">{item.description}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-[#FF5722] ml-4 shrink-0">
                  £{parseFloat(item.price).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>

      <AddItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurant.id}
        onSuccess={refetch}
      />
    </div>
  )
}
