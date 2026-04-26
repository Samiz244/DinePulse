import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Category, Restaurant } from '../types'

interface MenuPanelProps {
  restaurant: Restaurant
}

export default function MenuPanel({ restaurant }: MenuPanelProps) {
  const [categories,      setCategories]      = useState<Category[]>([])
  const [isLoading,       setIsLoading]       = useState(true)
  const [fetchError,      setFetchError]      = useState<string | null>(null)
  const [addingCategory,  setAddingCategory]  = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [submitError,     setSubmitError]     = useState<string | null>(null)

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

  useEffect(() => {
    fetchCategories()
  }, [restaurant.id])

  async function handleAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return

    setIsSubmitting(true)
    setSubmitError(null)

    const nextSortOrder = categories.length > 0
      ? Math.max(...categories.map(c => c.sort_order)) + 1
      : 0

    const { error } = await supabase
      .from('menu_categories')
      .insert({ restaurant_id: restaurant.id, name, sort_order: nextSortOrder })

    setIsSubmitting(false)

    if (error) {
      setSubmitError('Failed to add category. Please try again.')
      return
    }

    setNewCategoryName('')
    setAddingCategory(false)
    fetchCategories()
  }

  function handleToggleAdd() {
    setAddingCategory(v => !v)
    setNewCategoryName('')
    setSubmitError(null)
  }

  return (
    <>
      <div className="mp-header">
        <h2 className="mp-title">Menu Categories</h2>
        <button className="mp-add-btn" onClick={handleToggleAdd}>
          {addingCategory ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

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
          <button type="submit" disabled={isSubmitting} className="mc-add-submit">
            {isSubmitting ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      {(fetchError || submitError) && (
        <p className="mp-error">{fetchError ?? submitError}</p>
      )}

      {isLoading ? (
        <p className="mp-loading">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="mp-empty">
          <p className="mp-empty-icon">📂</p>
          <p className="mp-empty-title">No categories yet</p>
          <p className="mp-empty-sub">
            Start by adding one like 'Appetizers' or 'Main Dishes'.
          </p>
        </div>
      ) : (
        <ul className="mc-list">
          {categories.map(cat => (
            <li key={cat.id} className="mc-item">
              <span className="mc-item-name">{cat.name}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
