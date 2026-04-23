import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import './LandingPage.css'

interface LeadForm {
  email:           string
  restaurant_name: string
}

export default function LandingPage() {
  const [form, setForm]         = useState<LeadForm>({ email: '', restaurant_name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: dbError } = await supabase.from('leads').insert({
      email:           form.email.trim().toLowerCase(),
      restaurant_name: form.restaurant_name.trim(),
      status:          'pending',
    })

    setSubmitting(false)

    if (dbError) {
      if (dbError.message.includes('duplicate') || dbError.message.includes('unique')) {
        setError("This email has already been submitted. We'll be in touch soon.")
      } else {
        setError('Something went wrong. Please try again.')
      }
      return
    }

    setSuccess(true)
    setForm({ email: '', restaurant_name: '' })
  }

  return (
    <div className="lp-page">

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="lp-nav">
        <span className="lp-nav-logo">DinePulse</span>
        <div className="lp-nav-actions">
          <Link to="/staff" className="lp-btn-ghost">Staff Entry</Link>
          <Link to="/login" className="lp-btn-primary">Sign In</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-tag">
          <span className="lp-hero-tag-dot" />
          Real-time restaurant operations
        </div>

        <h1 className="lp-hero-headline">
          The Synchronized<br />
          <span className="lp-hero-headline-accent">Dining Room.</span>
        </h1>

        <p className="lp-hero-sub">
          Turn dining room chaos into a real-time reactive loop. Every order, every table,
          every kitchen ticket — in perfect sync from the moment a guest sits down.
        </p>

        <div className="lp-hero-cta-row">
          <a href="#partner" className="lp-btn-hero-primary">
            Partner with us →
          </a>
          <a href="#portals" className="lp-btn-hero-ghost">
            See how it works
          </a>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="lp-stats">
        {[
          { value: '<2s',   label: 'Order-to-kitchen latency' },
          { value: '99.9%', label: 'Uptime guarantee' },
          { value: '0',     label: 'Missed tickets' },
          { value: '∞',     label: 'Tables, no bottleneck' },
        ].map(({ value, label }) => (
          <div key={label} className="lp-stat">
            <span className="lp-stat-value">{value}</span>
            <p className="lp-stat-label">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="lp-features">
        <p className="lp-section-label">The platform</p>
        <h2 className="lp-section-title">One loop.<br />Every role connected.</h2>
        <p className="lp-section-sub">
          DinePulse is not a POS. It's the reactive layer between your front-of-house,
          kitchen, and management — built to close the loop in real time.
        </p>

        <div className="lp-features-grid">
          {[
            {
              icon: '⚡',
              title: 'Live Order Stream',
              desc:  'Every item added by a customer appears on the KDS within milliseconds — no polling, no refresh.',
            },
            {
              icon: '🍽️',
              title: 'Menu Management',
              desc:  'Managers update prices and availability from any device. Changes propagate instantly to every public menu.',
            },
            {
              icon: '👨‍🍳',
              title: 'Kitchen Display System',
              desc:  'Staff access the KDS with a short code — no logins, no friction. Designed for the heat of service.',
            },
            {
              icon: '📊',
              title: 'Single Source of Truth',
              desc:  'One database, one schema. Every role reads from and writes to the same live data layer.',
            },
            {
              icon: '🔒',
              title: 'Role-Based Access',
              desc:  'Customers browse. Managers administer. Staff execute. Each role sees exactly what they need.',
            },
            {
              icon: '📱',
              title: 'Mobile-First',
              desc:  'Built for the pocket-sized devices your team already carries. No hardware investment required.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="lp-feature-card">
              <div className="lp-feature-icon">{icon}</div>
              <p className="lp-feature-title">{title}</p>
              <p className="lp-feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portal cards ─────────────────────────────────── */}
      <section className="lp-portals" id="portals">
        <p className="lp-section-label">Access portals</p>
        <h2 className="lp-section-title">Your role. Your view.</h2>
        <p className="lp-section-sub">
          Every stakeholder in the dining room has a dedicated, purpose-built interface.
        </p>

        <div className="lp-portals-grid">
          <Link to="/login" className="lp-portal-card">
            <div className="lp-portal-card-glow" />
            <span className="lp-portal-icon">🏢</span>
            <p className="lp-portal-title">Manage Your Restaurant</p>
            <p className="lp-portal-desc">
              Sign in to your manager dashboard. Update your menu, review your setup,
              and monitor your restaurant in real time.
            </p>
            <span className="lp-portal-arrow">→</span>
          </Link>

          <Link to="/staff" className="lp-portal-card">
            <div className="lp-portal-card-glow" />
            <span className="lp-portal-icon">👨‍🍳</span>
            <p className="lp-portal-title">Staff Entry</p>
            <p className="lp-portal-desc">
              Access the kitchen display and order queue with your restaurant's staff code.
              No account required.
            </p>
            <span className="lp-portal-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* ── Lead form ────────────────────────────────────── */}
      <section className="lp-partner" id="partner">
        <p className="lp-section-label">Early access</p>
        <h2 className="lp-section-title">Partner with us.</h2>
        <p className="lp-section-sub">
          DinePulse is invite-only. Submit your details and we'll reach out when
          your account is ready.
        </p>

        {success ? (
          <div className="lp-form-success">
            ✓ You're on the list. We'll be in touch soon.
          </div>
        ) : (
          <form className="lp-partner-form" onSubmit={handleLeadSubmit}>
            <div className="lp-input-group">
              <label htmlFor="lp-restaurant" className="lp-input-label">
                Restaurant name
              </label>
              <input
                id="lp-restaurant"
                name="restaurant_name"
                type="text"
                required
                value={form.restaurant_name}
                onChange={handleChange}
                placeholder="The Burger Joint"
                className="lp-input"
              />
            </div>

            <div className="lp-input-group">
              <label htmlFor="lp-email" className="lp-input-label">
                Email address
              </label>
              <input
                id="lp-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="owner@example.com"
                className="lp-input"
              />
            </div>

            {error && <p className="lp-form-error">{error}</p>}

            <button type="submit" disabled={submitting} className="lp-form-submit">
              {submitting ? 'Submitting…' : 'Request early access →'}
            </button>
          </form>
        )}
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="lp-footer">
        <span className="lp-footer-brand">DinePulse</span>
        <span className="lp-footer-copy">© 2026 DinePulse. All rights reserved.</span>
      </footer>

    </div>
  )
}
