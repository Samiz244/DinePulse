export type UserRole = 'customer' | 'manager' | 'staff'

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
  category:      string
  is_available:  boolean
  created_at:    string
}

export interface Lead {
  id:              string
  email:           string
  restaurant_name: string
  status:          'pending' | 'approved'
  created_at:      string
}

export interface StaffSession {
  restaurantId: string
  code:         string
  grantedAt:    number
}
