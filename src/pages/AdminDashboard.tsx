import { useAuth } from '../context/AuthContext'
import { useRestaurant } from '../hooks/useRestaurant'
import RestaurantSetupForm from '../components/RestaurantSetupForm'
import MenuDashboard from '../components/MenuDashboard'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { restaurant, isLoading: restaurantLoading, refetch } = useRestaurant(user)

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-sm text-[#757575]">Loading…</p>
      </div>
    )
  }

  if (!restaurant) {
    return <RestaurantSetupForm onSuccess={refetch} />
  }

  return <MenuDashboard restaurant={restaurant} />
}
