export type UserRole = 'customer' | 'manager' | 'staff'

// Mirrors the CHECK constraint on menu_items.category in the DB schema.
// Update both here and the MENU_CATEGORIES constant if categories change.
export type MenuCategory = 'Pizzas' | 'Sides' | 'Drinks' | 'Desserts'

export interface AuthUser {
  id:       string
  email:    string
  fullName: string
  role:     UserRole
}

export interface Restaurant {
  id:           string
  owner_id:     string
  name:         string
  cuisine_type: string | null
  slug:         string | null
  created_at:   string
}

export interface MenuItem {
  id:            string
  restaurant_id: string
  name:          string
  description:   string | null
  price:         number
  category:      MenuCategory
  is_available:  boolean
  created_at:    string
}

export interface Category {
  id:            string
  restaurant_id: string
  name:          string
  sort_order:    number
  created_at:    string
}

export interface CartItem {
  id:       string
  name:     string
  price:    number   // unit price snapshotted at add time
  quantity: number   // always ≥ 1
}

export interface CartState {
  restaurantId: string | null   // null = empty, unbound cart
  items:        CartItem[]
}

export interface Lead {
  id:              string
  email:           string
  restaurant_name: string
  status:          'pending' | 'approved'
  created_at:      string
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed'

export interface OrderItem {
  id:            string
  order_id:      string
  menu_item_id:  string | null  // null if item was deleted post-order
  name:          string         // snapshot at order time
  quantity:      number
  price_at_time: number
}

export interface Order {
  id:            string
  restaurant_id: string
  table_number:  number | null
  status:        OrderStatus
  total_price:   number
  created_at:    string
  order_items:   OrderItem[]
}

export type KDSOrder = Order

export interface StaffSession {
  restaurantId: string
  code:         string
  grantedAt:    number
}
