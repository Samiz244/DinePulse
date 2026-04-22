import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function useMenuItems(restaurantId) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!restaurantId) {
      setItems([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    supabase
      .from('menu_items')
      .select('id, restaurant_id, name, description, price, category, is_available, created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (cancelled) return
        if (queryError) setError(queryError.message)
        else setItems(data ?? [])
        setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [restaurantId, tick])

  function refetch() {
    setTick((t) => t + 1)
  }

  return { items, isLoading, error, refetch }
}
