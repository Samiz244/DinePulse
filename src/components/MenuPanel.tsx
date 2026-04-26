import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Category, Restaurant } from '../types'

// Aligned with 013_create_menu_items.sql + 014_create_menu_options.sql
interface ItemOption {
  label:            string
  price_adjustment: number
}

interface MenuItem {
  id:            string
  category_id:   string
  restaurant_id: string
  name:          string
  description:   string | null
  price:         number
  image_url:     string | null
  is_available:  boolean
  sort_order:    number
  options:       ItemOption[] | null
  created_at:    string
}

interface MenuPanelProps {
  restaurant: Restaurant
}

export default function MenuPanel({ restaurant }: MenuPanelProps) {
  // ── Categories ──────────────────────────────────────────────
  const [categories,      setCategories]      = useState<Category[]>([])
  const [isLoading,       setIsLoading]       = useState(true)
  const [fetchError,      setFetchError]      = useState<string | null>(null)
  const [addingCategory,  setAddingCategory]  = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [catSubmitting,   setCatSubmitting]   = useState(false)
  const [catSubmitError,  setCatSubmitError]  = useState<string | null>(null)

  // ── Items ───────────────────────────────────────────────────
  const [menuItems,             setMenuItems]             = useState<MenuItem[]>([])
  const [itemsError,            setItemsError]            = useState<string | null>(null)
  const [addingItemForCategory, setAddingItemForCategory] = useState<string | null>(null)
  const [editingItem,           setEditingItem]           = useState<MenuItem | null>(null)

  // ── Shared form fields (used by both create and edit) ────────
  const [newItemName,        setNewItemName]        = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemPrice,       setNewItemPrice]       = useState('')
  const [itemSubmitting,     setItemSubmitting]     = useState(false)
  const [itemSubmitError,    setItemSubmitError]    = useState<string | null>(null)

  // ── Options (multiple additive modifiers) ───────────────────
  const [options, setOptions] = useState<Array<{ label: string; price: string }>>([])

  function addOptionRow() {
    setOptions(prev => [...prev, { label: '', price: '' }])
  }

  function updateOption(index: number, field: 'label' | 'price', value: string) {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, [field]: value } : opt))
  }

  function removeOption(index: number) {
    setOptions(prev => prev.filter((_, i) => i !== index))
  }

  // ── Fetch ───────────────────────────────────────────────────

  async function fetchCategories() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('menu_categories')
      .select('id, restaurant_id, name, sort_order, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })

    if (error) {
      setFetchError('Failed to load categories.')
    } else {
      setCategories(data ?? [])
      setFetchError(null)
    }
    setIsLoading(false)
  }

  async function fetchItems() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, category_id, restaurant_id, name, description, price, image_url, is_available, sort_order, options, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })

    if (error) {
      setItemsError('Failed to load items.')
    } else {
      setMenuItems((data ?? []) as MenuItem[])
      setItemsError(null)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchItems()
  }, [restaurant.id])

  // ── Form helpers ────────────────────────────────────────────

  function closeForm() {
    setAddingItemForCategory(null)
    setEditingItem(null)
    setNewItemName('')
    setNewItemDescription('')
    setNewItemPrice('')
    setOptions([])
    setItemSubmitError(null)
  }

  function openItemForm(categoryId: string) {
    setEditingItem(null)
    setAddingItemForCategory(categoryId)
    setNewItemName('')
    setNewItemDescription('')
    setNewItemPrice('')
    setOptions([])
    setItemSubmitError(null)
  }

  function openEditForm(item: MenuItem) {
    setAddingItemForCategory(null)
    setEditingItem(item)
    setNewItemName(item.name)
    setNewItemDescription(item.description ?? '')
    setNewItemPrice(String(item.price))
    setOptions(
      (item.options ?? []).map(o => ({
        label: o.label,
        price: String(o.price_adjustment),
      }))
    )
    setItemSubmitError(null)
  }

  function buildOptionsPayload(): ItemOption[] {
    return options
      .filter(o => o.label.trim() !== '')
      .map(o => ({
        label:            o.label.trim(),
        price_adjustment: parseFloat(o.price) || 0,
      }))
  }

  // ── Add category ────────────────────────────────────────────

  async function handleAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return

    setCatSubmitting(true)
    setCatSubmitError(null)

    const nextSortOrder = categories.length > 0
      ? Math.max(...categories.map(c => c.sort_order)) + 1
      : 0

    const { error } = await supabase
      .from('menu_categories')
      .insert({ restaurant_id: restaurant.id, name, sort_order: nextSortOrder })

    setCatSubmitting(false)

    if (error) {
      setCatSubmitError('Failed to add category. Please try again.')
      return
    }

    setNewCategoryName('')
    setAddingCategory(false)
    fetchCategories()
  }

  function handleToggleAddCategory() {
    setAddingCategory(v => !v)
    setNewCategoryName('')
    setCatSubmitError(null)
  }

  // ── Create item ─────────────────────────────────────────────

  async function handleCreateItem(
    e: React.FormEvent<HTMLFormElement>,
    categoryId: string,
  ) {
    e.preventDefault()
    const name  = newItemName.trim()
    const price = parseFloat(newItemPrice)
    if (!name || isNaN(price) || price < 0) return

    setItemSubmitting(true)
    setItemSubmitError(null)

    const catItems      = menuItems.filter(i => i.category_id === categoryId)
    const nextSortOrder = catItems.length > 0
      ? Math.max(...catItems.map(i => i.sort_order)) + 1
      : 0

    const builtOptions = buildOptionsPayload()
    const payload: Record<string, unknown> = {
      restaurant_id: restaurant.id,
      category_id:   categoryId,
      name,
      description:   newItemDescription.trim() || null,
      price,
      sort_order:    nextSortOrder,
    }
    if (builtOptions.length > 0) payload.options = builtOptions

    const { error } = await supabase.from('menu_items').insert(payload)

    setItemSubmitting(false)

    if (error) {
      setItemSubmitError('Failed to add item. Please try again.')
      return
    }

    closeForm()
    fetchItems()
  }

  // ── Update item ─────────────────────────────────────────────

  async function handleUpdateItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingItem) return

    const name  = newItemName.trim()
    const price = parseFloat(newItemPrice)
    if (!name || isNaN(price) || price < 0) return

    setItemSubmitting(true)
    setItemSubmitError(null)

    const builtOptions = buildOptionsPayload()
    const payload: Record<string, unknown> = {
      name,
      description: newItemDescription.trim() || null,
      price,
      options:     builtOptions.length > 0 ? builtOptions : null,
    }

    const { error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', editingItem.id)
      .eq('restaurant_id', restaurant.id)

    setItemSubmitting(false)

    if (error) {
      setItemSubmitError('Failed to update item. Please try again.')
      return
    }

    closeForm()
    fetchItems()
  }

  // ── Delete item ─────────────────────────────────────────────

  async function handleDeleteItem(itemId: string) {
    if (!window.confirm('Delete this item? This cannot be undone.')) return

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)
      .eq('restaurant_id', restaurant.id)

    if (error) {
      setItemsError('Failed to delete item. Please try again.')
      return
    }

    fetchItems()
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <>
      {/* Category header */}
      <div className="mp-header">
        <h2 className="mp-title">Menu</h2>
        <button className="mp-add-btn" onClick={handleToggleAddCategory}>
          {addingCategory ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add category form */}
      {addingCategory && (
        <form className="mc-add-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            className="mc-add-input"
            placeholder="e.g. Appetizers, Main Dishes"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" disabled={catSubmitting} className="mc-add-submit">
            {catSubmitting ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      {/* Top-level errors */}
      {fetchError     && <p className="mp-error">{fetchError}</p>}
      {itemsError     && <p className="mp-error">{itemsError}</p>}
      {catSubmitError && <p className="mp-error">{catSubmitError}</p>}

      {/* Body */}
      {isLoading ? (
        <p className="mp-loading">Loading…</p>
      ) : categories.length === 0 ? (
        <div className="mp-empty">
          <p className="mp-empty-icon">📂</p>
          <p className="mp-empty-title">No categories yet</p>
          <p className="mp-empty-sub">
            Start by adding one like 'Appetizers' or 'Main Dishes'.
          </p>
        </div>
      ) : (
        <div className="mc-sections">
          {categories.map(cat => {
            const catItems    = menuItems.filter(i => i.category_id === cat.id)
            const isAddingHere = addingItemForCategory === cat.id
            const isEditingHere = editingItem?.category_id === cat.id
            const isFormOpen = isAddingHere || isEditingHere

            return (
              <div key={cat.id} className="mc-section">

                {/* Category header row */}
                <div className="mc-section-header">
                  <span className="mc-section-name">{cat.name}</span>
                  <button
                    className="mc-add-item-btn"
                    onClick={() => isAddingHere ? closeForm() : openItemForm(cat.id)}
                  >
                    {isAddingHere ? 'Cancel' : '+ Add Item'}
                  </button>
                </div>

                {/* Item list */}
                {catItems.length > 0 && (
                  <ul className="mc-item-list">
                    {catItems.map(item => {
                      const isBeingEdited = editingItem?.id === item.id
                      return (
                        <li
                          key={item.id}
                          className={`mc-item-row${isBeingEdited ? ' mc-item-row--editing' : ''}`}
                        >
                          <div className="mc-item-row-info">
                            <span className="mc-item-row-name">{item.name}</span>
                            {item.description && (
                              <span className="mc-item-row-desc">{item.description}</span>
                            )}
                            {item.options && item.options.length > 0 && (
                              <div className="mc-item-options">
                                {item.options.map((opt, i) => (
                                  <span key={i} className="mc-option-tag">
                                    {opt.label}
                                    {opt.price_adjustment > 0
                                      ? ` +$${opt.price_adjustment.toFixed(2)}`
                                      : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mc-item-row-actions">
                            <span className="mc-item-row-price">
                              ${parseFloat(String(item.price)).toFixed(2)}
                            </span>
                            <button
                              className="mc-item-edit-btn"
                              onClick={() => isBeingEdited ? closeForm() : openEditForm(item)}
                              aria-label={`Edit ${item.name}`}
                            >
                              ✏
                            </button>
                            <button
                              className="mc-item-delete-btn"
                              onClick={() => handleDeleteItem(item.id)}
                              aria-label={`Delete ${item.name}`}
                            >
                              🗑
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* Empty state per category */}
                {catItems.length === 0 && !isFormOpen && (
                  <p className="mc-items-empty">No items yet.</p>
                )}

                {/* Create / Edit form — shared, one per category at a time */}
                {isFormOpen && (
                  <form
                    className="mc-item-form"
                    onSubmit={isEditingHere
                      ? handleUpdateItem
                      : e => handleCreateItem(e, cat.id)
                    }
                  >
                    <input
                      type="text"
                      className="mc-add-input"
                      placeholder="Item name"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      autoFocus
                      required
                    />
                    <input
                      type="text"
                      className="mc-add-input"
                      placeholder="Description (optional)"
                      value={newItemDescription}
                      onChange={e => setNewItemDescription(e.target.value)}
                    />
                    <div className="mc-item-form-row">
                      <input
                        type="number"
                        className="mc-add-input mc-price-input"
                        placeholder="Base price"
                        value={newItemPrice}
                        onChange={e => setNewItemPrice(e.target.value)}
                        step="0.01"
                        min="0"
                        required
                      />
                      <button
                        type="submit"
                        disabled={itemSubmitting}
                        className="mc-add-submit"
                      >
                        {itemSubmitting
                          ? (isEditingHere ? 'Updating…' : 'Saving…')
                          : (isEditingHere ? 'Update Item' : 'Save Item')
                        }
                      </button>
                    </div>

                    {/* Options rows */}
                    {options.map((opt, i) => (
                      <div key={i} className="mc-item-form-row mc-option-row">
                        <input
                          type="text"
                          className="mc-add-input"
                          placeholder='Label (e.g. "Large")'
                          value={opt.label}
                          onChange={e => updateOption(i, 'label', e.target.value)}
                        />
                        <input
                          type="number"
                          className="mc-add-input mc-price-input"
                          placeholder="+0.00"
                          value={opt.price}
                          onChange={e => updateOption(i, 'price', e.target.value)}
                          step="0.01"
                          min="0"
                        />
                        <button
                          type="button"
                          className="mc-option-remove-btn"
                          onClick={() => removeOption(i)}
                          aria-label="Remove option"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <div className="mc-item-form-footer">
                      <button
                        type="button"
                        className="mc-add-option-btn"
                        onClick={addOptionRow}
                      >
                        + Add Option
                      </button>
                      {isEditingHere && (
                        <button
                          type="button"
                          className="mc-cancel-edit-btn"
                          onClick={closeForm}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {itemSubmitError && (
                      <p className="mp-error">{itemSubmitError}</p>
                    )}
                  </form>
                )}

              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
