import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRestaurant } from '../hooks/useRestaurant'
import RestaurantSetupForm from '../components/RestaurantSetupForm'
import MenuPanel from '../components/MenuPanel'
import QRPanel from '../components/QRPanel'
import type { Restaurant } from '../types'
import './AdminDashboard.css'

type DashboardTab = 'overview' | 'menu' | 'qr'

const TAB_LABELS: Record<DashboardTab, string> = {
  overview: 'Overview',
  menu:     'Menu',
  qr:       'QR Codes',
}

export default function AdminDashboard() {
  const { user, signOut }  = useAuth()
  const { restaurant: raw, isLoading, refetch } = useRestaurant(user) as {
    restaurant: Restaurant | null
    isLoading:  boolean
    error:      string | null
    refetch:    () => void
  }

  const [activeTab, setActiveTab] = useState<DashboardTab>('menu')

  if (isLoading) {
    return (
      <div className="ad-loading">
        <p className="ad-loading-text">Loading…</p>
      </div>
    )
  }

  if (!raw) {
    return <RestaurantSetupForm onSuccess={refetch} />
  }

  const restaurant = raw

  return (
    <div className="ad-page">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="ad-header">
        <div className="ad-header-inner">
          <div className="ad-header-left">
            <span className="ad-brand">DinePulse</span>
            <span className="ad-restaurant-name">{restaurant.name}</span>
            <span className="ad-restaurant-meta">
              {restaurant.cuisine_type && <span>{restaurant.cuisine_type}</span>}
              {restaurant.slug && (
                <a
                  href={`/restaurant/${restaurant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ad-public-link"
                >
                  View public page ↗
                </a>
              )}
            </span>
          </div>
          <button className="ad-signout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="ad-tabs-wrap">
        <nav className="ad-tabs">
          {(Object.keys(TAB_LABELS) as DashboardTab[]).map(tab => (
            <button
              key={tab}
              className={`ad-tab${activeTab === tab ? ' ad-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <main className="ad-content">

        {activeTab === 'overview' && (
          <div className="ad-overview-card">
            <p className="ad-overview-icon">📊</p>
            <p className="ad-overview-title">Live stats coming soon</p>
            <p className="ad-overview-sub">
              Real-time order counts and revenue will appear here in the next release.
            </p>
          </div>
        )}

        {activeTab === 'menu' && (
          <MenuPanel restaurant={restaurant} />
        )}

        {activeTab === 'qr' && (
          <QRPanel restaurant={restaurant} />
        )}

      </main>
    </div>
  )
}
