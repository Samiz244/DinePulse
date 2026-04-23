import { useState } from 'react'
import { useMenuItems } from '../hooks/useMenuItems'
import MenuItemModal from './MenuItemModal'
import type { MenuItem, Restaurant } from '../types'

interface MenuPanelProps {
  restaurant: Restaurant
}

export default function MenuPanel({ restaurant }: MenuPanelProps) {
  const { items, isLoading, error, refetch, toggleAvailability, deleteItem } =
    useMenuItems(restaurant.id)

  const [addOpen,      setAddOpen]      = useState(false)
  const [editingItem,  setEditingItem]  = useState<MenuItem | null>(null)
  const [deleteError,  setDeleteError]  = useState<string | null>(null)

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setDeleteError(null)
    await deleteItem(item.id)
  }

  return (
    <>
      <div className="mp-header">
        <h2 className="mp-title">Your Menu</h2>
        <button className="mp-add-btn" onClick={() => setAddOpen(true)}>
          + Add Item
        </button>
      </div>

      {(error || deleteError) && (
        <p className="mp-error">{error ?? deleteError}</p>
      )}

      {isLoading ? (
        <p className="mp-loading">Loading menu…</p>
      ) : items.length === 0 ? (
        <div className="mp-empty">
          <p className="mp-empty-icon">🍽️</p>
          <p className="mp-empty-title">No items yet</p>
          <p className="mp-empty-sub">Add your first menu item to get started.</p>
        </div>
      ) : (
        <ul className="mp-list">
          {items.map(item => (
            <li key={item.id} className={`mp-item${item.is_available ? '' : ' mp-item--unavailable'}`}>
              <div className="mp-item-info">
                <p className="mp-item-name">{item.name}</p>
                <div className="mp-item-meta">
                  <span className="mp-badge">{item.category}</span>
                </div>
                {item.description && (
                  <p className="mp-item-desc">{item.description}</p>
                )}
              </div>

              <div className="mp-item-actions">
                <span className="mp-item-price">£{parseFloat(String(item.price)).toFixed(2)}</span>
                <button
                  className={`mp-toggle ${item.is_available ? 'mp-toggle--on' : 'mp-toggle--off'}`}
                  onClick={() => toggleAvailability(item)}
                >
                  {item.is_available ? 'In Stock' : 'Out of Stock'}
                </button>
                <button className="mp-edit-btn" onClick={() => setEditingItem(item)}>
                  Edit
                </button>
                <button className="mp-delete-btn" onClick={() => handleDelete(item)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MenuItemModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        restaurantId={restaurant.id}
        onSuccess={refetch}
        mode="add"
      />

      <MenuItemModal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        restaurantId={restaurant.id}
        onSuccess={() => { refetch(); setEditingItem(null) }}
        mode="edit"
        initialData={editingItem}
      />
    </>
  )
}
