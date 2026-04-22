import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { MENU_CATEGORIES } from '../constants/menuCategories'

export function usePublicMenu(restaurantId) {
  const [restaurant, setRestaurant] = useState(null)
  const [items,      setItems]      = useState([])
  const [isLoading,  setIsLoading]  = useState(false)
  const [notFound,   setNotFound]   = useState(false)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    if (!restaurantId) return

    let cancelled = false
    setIsLoading(true)
    setNotFound(false)
    setError(null)

    Promise.all([
      supabase
        .from('restaurants')
        .select('id, name, cuisine_type')
        .eq('id', restaurantId)
        .maybeSingle(),
      supabase
        .from('menu_items')
        .select('id, name, description, price, category')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true }),
    ]).then(([{ data: restaurantData, error: rErr }, { data: itemsData, error: iErr }]) => {
      if (cancelled) return

      if (rErr || !restaurantData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      if (iErr) {
        setError('Failed to load menu.')
        setIsLoading(false)
        return
      }

      setRestaurant(restaurantData)
      setItems(itemsData ?? [])
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [restaurantId])

  const groupedMenu = MENU_CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  return { restaurant, groupedMenu, isLoading, notFound, error }
}
