import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { useRestaurant } from './hooks/useRestaurant'
import AuthModal from './components/AuthModal'
import RestaurantSetupForm from './components/RestaurantSetupForm'

function App() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const { restaurant, isLoading: restaurantLoading, refetch } = useRestaurant(user)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Hold render until auth session is resolved — prevents flash of wrong state
  if (authLoading) return null

  // Manager with no restaurant → onboarding flow
  if (user?.role === 'manager') {
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
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-[#FF5722]">
          DinePulse
        </span>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#212121] truncate max-w-[120px]">
              {user.fullName}
            </span>
            <button
              onClick={signOut}
              className="text-sm font-medium text-[#FF5722] border border-[#FF5722] rounded-full px-4 py-1.5 hover:bg-[#FF5722] hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="text-sm font-medium text-[#FF5722] border border-[#FF5722] rounded-full px-4 py-1.5 hover:bg-[#FF5722] hover:text-white transition-colors"
          >
            Sign in
          </button>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Hero */}
      <section className="bg-white px-4 pt-10 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#212121] leading-tight">
          Discover &amp; order<br />
          <span className="text-[#FF5722]">amazing food</span>
        </h1>
        <p className="mt-4 text-base text-[#757575] max-w-sm mx-auto">
          Your favourite restaurants, delivered fast.
        </p>

        {/* Search bar */}
        <div className="mt-6 flex items-center gap-2 bg-[#F5F5F5] rounded-xl px-4 py-3 max-w-md mx-auto shadow-sm">
          <svg className="w-5 h-5 text-[#757575] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search restaurants or cuisines…"
            className="flex-1 bg-transparent text-sm text-[#212121] placeholder-[#BDBDBD] outline-none"
          />
        </div>

        {/* CTA */}
        <button className="mt-6 w-full max-w-md mx-auto block bg-[#FF5722] text-white font-semibold rounded-xl py-3.5 text-base hover:bg-[#E64A19] active:scale-95 transition-all">
          Find food near me
        </button>
      </section>

      {/* Category pills */}
      <section className="px-4 pt-6">
        <h2 className="text-base font-semibold text-[#212121] mb-3">Browse by category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['🍕 Pizza', '🍔 Burgers', '🍣 Sushi', '🌮 Tacos', '🍜 Noodles', '🥗 Healthy', '🍗 Chicken', '🍦 Desserts'].map((cat) => (
            <button
              key={cat}
              className="shrink-0 bg-white rounded-xl px-4 py-2 text-sm font-medium text-[#212121] shadow-sm hover:shadow-md hover:text-[#FF5722] transition-all border border-transparent hover:border-[#FF5722]"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured restaurants */}
      <section className="px-4 pt-8 pb-24">
        <h2 className="text-base font-semibold text-[#212121] mb-4">Featured near you</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "The Burger Joint", tag: "Burgers · $$", time: "20–30 min", rating: "4.8" },
            { name: "Tokyo Ramen House", tag: "Japanese · $$", time: "25–35 min", rating: "4.7" },
            { name: "Slice &amp; Dice Pizza", tag: "Pizza · $", time: "15–25 min", rating: "4.9" },
            { name: "Green Bowl Co.", tag: "Healthy · $$", time: "20–30 min", rating: "4.6" },
          ].map((r) => (
            <div key={r.name} className="bg-white rounded-[1rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-36 bg-gradient-to-br from-[#FF8A65] to-[#FF5722] flex items-center justify-center">
                <span className="text-white text-4xl">🍽️</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-[#212121] text-sm"
                  dangerouslySetInnerHTML={{ __html: r.name }} />
                <p className="text-xs text-[#757575] mt-0.5"
                  dangerouslySetInnerHTML={{ __html: r.tag }} />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#757575]">{r.time}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-[#FF5722]">
                    ⭐ {r.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E0E0E0] flex justify-around py-3 z-50">
        {[
          { icon: '🏠', label: 'Home' },
          { icon: '🔍', label: 'Search' },
          { icon: '🛒', label: 'Orders' },
          { icon: '👤', label: 'Profile' },
        ].map(({ icon, label }) => (
          <button key={label} className="flex flex-col items-center gap-0.5 text-[#757575] hover:text-[#FF5722] transition-colors">
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}

export default App
