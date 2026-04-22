import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function useRestaurant(user) {
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      setRestaurant(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    supabase
      .from('restaurants')
      .select('id, owner_id, name, cuisine_type, created_at')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (cancelled) return
        if (queryError) setError(queryError.message)
        else setRestaurant(data)
        setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [user, tick])

  function refetch() {
    setTick((t) => t + 1)
  }

  return { restaurant, isLoading, error, refetch }
}
