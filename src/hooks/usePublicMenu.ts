import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { MENU_CATEGORIES } from '../constants/menuCategories'

interface PublicRestaurant {
  id:           string
  name:         string
  cuisine_type: string | null
}

interface PublicMenuItem {
  id:          string
  name:        string
  description: string | null
  price:       number
  category:    string
}

export function usePublicMenu(slug: string) {
  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null)
  const [items,      setItems]      = useState<PublicMenuItem[]>([])
  const [isLoading,  setIsLoading]  = useState(false)
  const [notFound,   setNotFound]   = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    setIsLoading(true)
    setNotFound(false)
    setError(null)

    async function fetchMenu() {
      // Step 1: resolve restaurant by slug
      const { data: restaurantData, error: rErr } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type')
        .eq('slug', slug)
        .maybeSingle()

      if (cancelled) return

      if (rErr || !restaurantData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      // Step 2: fetch items by resolved restaurant id
      const { data: itemsData, error: iErr } = await supabase
        .from('menu_items')
        .select('id, name, description, price, category')
        .eq('restaurant_id', restaurantData.id)
        .order('created_at', { ascending: true })

      if (cancelled) return

      if (iErr) {
        setError('Failed to load menu.')
        setIsLoading(false)
        return
      }

      setRestaurant(restaurantData)
      setItems(itemsData ?? [])
      setIsLoading(false)
    }

    fetchMenu()
    return () => { cancelled = true }
  }, [slug])

  const groupedMenu = MENU_CATEGORIES.reduce((acc: Record<string, PublicMenuItem[]>, cat: string) => {
    const catItems = items.filter((i) => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  return { restaurant, groupedMenu, isLoading, notFound, error }
}
