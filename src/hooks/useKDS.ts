import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { KDSOrder, OrderStatus } from '../types'

interface UseKDSResult {
  orders:       KDSOrder[]
  isLoading:    boolean
  error:        string | null
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>
}

export function useKDS(restaurantId: string, staffCode: string): UseKDSResult {
  const [orders, setOrders]     = useState<KDSOrder[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('orders')
      .select(`
        id, table_number, status, total_price, created_at,
        order_items ( id, menu_item_id, name, quantity, price_at_time )
      `)
      .eq('restaurant_id', restaurantId)
      .neq('status', 'completed')
      .order('created_at', { ascending: true })

    if (err) { setError('Failed to load orders.'); setLoading(false); return }
    setOrders((data ?? []) as KDSOrder[])
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel(`kds:${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => fetchOrders()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurantId, fetchOrders])

  async function updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await supabase.rpc('update_order_status', {
      p_order_id:      orderId,
      p_restaurant_id: restaurantId,
      p_code:          staffCode,
      p_status:        status,
    })
    // Realtime subscription fires → fetchOrders re-runs automatically
  }

  return { orders, isLoading, error, updateStatus }
}
