import { useNavigate } from 'react-router-dom'
import { useKDS } from '../hooks/useKDS'
import { getStaffSession, STAFF_SESSION_KEY } from '../guards/StaffGuard'
import type { KDSOrder, OrderStatus } from '../types'
import './StaffDashboard.css'

// ── Status display config ───────────────────────────────────────
type ProgressableStatus = 'pending' | 'preparing' | 'ready'

const STATUS_NEXT: Record<ProgressableStatus, OrderStatus> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'completed',
}

const STATUS_BTN: Record<ProgressableStatus, string> = {
  pending:   'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Complete Order',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ── Order card ──────────────────────────────────────────────────
function OrderCard({
  order,
  onAdvance,
}: {
  order:     KDSOrder
  onAdvance: (id: string, next: OrderStatus) => void
}) {
  const status = order.status as OrderStatus
  const isProgressable = status === 'pending' || status === 'preparing' || status === 'ready'

  return (
    <div className={`kds-card kds-card--${status}`}>
      <div className="kds-card-header">
        <span className="kds-table-num">
          {order.table_number ? `Table ${order.table_number}` : 'Walk-in'}
        </span>
        <div className="kds-card-meta">
          <span className="kds-time">{formatTime(order.created_at)}</span>
          <span className={`kds-badge kds-badge--${status}`}>{status}</span>
        </div>
      </div>

      <div className="kds-divider" />

      <ul className="kds-items">
        {order.order_items.map(item => (
          <li key={item.id} className="kds-item-row">
            <span className="kds-item-qty">×{item.quantity}</span>
            <span className="kds-item-name">{item.name}</span>
            <span className="kds-item-price">
              £{(item.price_at_time * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="kds-total-row">
        <span>Total</span>
        <span className="kds-total-value">£{Number(order.total_price).toFixed(2)}</span>
      </div>

      {isProgressable && (
        <div className="kds-action">
          <button
            className={`kds-action-btn kds-action-btn--${status}`}
            onClick={() => onAdvance(order.id, STATUS_NEXT[status as ProgressableStatus])}
          >
            {STATUS_BTN[status as ProgressableStatus]}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const navigate = useNavigate()
  const session  = getStaffSession()

  // StaffGuard prevents this, but TypeScript needs the narrowing
  if (!session) return null

  const { orders, isLoading, error, updateStatus } = useKDS(
    session.restaurantId,
    session.code,
  )

  function handleSignOut() {
    sessionStorage.removeItem(STAFF_SESSION_KEY)
    navigate('/staff', { replace: true })
  }

  return (
    <div className="kds-page">

      <header className="kds-header">
        <div className="kds-header-left">
          <span className="kds-brand">DinePulse</span>
          <span className="kds-subtitle">Kitchen Display System</span>
        </div>
        <button className="kds-signout-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <main className="kds-content">
        {isLoading ? (
          <p className="kds-loading">Connecting to kitchen…</p>
        ) : error ? (
          <p className="kds-error">{error}</p>
        ) : orders.length === 0 ? (
          <div className="kds-empty">
            <p className="kds-empty-icon">✓</p>
            <p className="kds-empty-title">All clear</p>
            <p className="kds-empty-sub">No pending orders. New orders will appear instantly.</p>
          </div>
        ) : (
          <div className="kds-grid">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={updateStatus}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
