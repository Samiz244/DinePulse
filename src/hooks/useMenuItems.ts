import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { MenuItem } from '../types'

interface UseMenuItemsResult {
  items:              MenuItem[]
  isLoading:          boolean
  error:              string | null
  refetch:            () => void
  toggleAvailability: (item: MenuItem) => Promise<void>
  deleteItem:         (id: string) => Promise<void>
}

export function useMenuItems(restaurantId: string | null): UseMenuItemsResult {
  const [items, setItems]     = useState<MenuItem[]>([])
  const [isLoading, setLoad]  = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  const refetch = () => setTick(t => t + 1)

  useEffect(() => {
    if (!restaurantId) {
      setItems([])
      setLoad(false)
      return
    }

    let cancelled = false
    setLoad(true)
    setError(null)

    supabase
      .from('menu_items')
      .select('id, restaurant_id, name, description, price, category, is_available, created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true })
      .then(({ data, error: qErr }) => {
        if (cancelled) return
        if (qErr) { setError('Failed to load menu.'); setLoad(false); return }
        setItems((data ?? []) as MenuItem[])
        setLoad(false)
      })

    return () => { cancelled = true }
  }, [restaurantId, tick])

  async function toggleAvailability(item: MenuItem): Promise<void> {
    const { error: err } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
      .eq('restaurant_id', item.restaurant_id)  // ownership guard
    if (!err) refetch()
  }

  async function deleteItem(id: string): Promise<void> {
    if (!restaurantId) return
    const { error: err } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId)        // ownership guard
    if (!err) refetch()
  }

  return { items, isLoading, error, refetch, toggleAvailability, deleteItem }
}
