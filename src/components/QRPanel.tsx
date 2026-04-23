import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import type { Restaurant } from '../types'

interface QRPanelProps {
  restaurant: Restaurant
}

const QR_ID = 'dp-qr-canvas'

export default function QRPanel({ restaurant }: QRPanelProps) {
  const [tableNumber, setTableNumber] = useState('')
  const [copied,      setCopied]      = useState(false)

  const qrUrl = restaurant.slug && tableNumber
    ? `${window.location.origin}/restaurant/${restaurant.slug}?table=${tableNumber}`
    : null

  function downloadQR() {
    const canvas = document.getElementById(QR_ID) as HTMLCanvasElement | null
    if (!canvas) return
    const a = document.createElement('a')
    a.href     = canvas.toDataURL('image/png')
    a.download = `${restaurant.slug}-table-${tableNumber}.png`
    a.click()
  }

  async function copyLink() {
    if (!qrUrl) return
    await navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!restaurant.slug) {
    return (
      <div className="qr-panel">
        <p className="qr-title">Table QR Codes</p>
        <p className="qr-no-slug">
          Your restaurant doesn't have a URL slug yet. Set one to enable QR code generation.
        </p>
      </div>
    )
  }

  return (
    <div className="qr-panel">
      <p className="qr-title">Table QR Codes</p>
      <p className="qr-sub">
        Generate a QR code for each table. Customers scan to open your menu with their table pre-filled.
      </p>

      <div className="qr-field">
        <label htmlFor="qr-table-input" className="qr-label">Table number</label>
        <input
          id="qr-table-input"
          type="number"
          min="1"
          max="999"
          value={tableNumber}
          onChange={e => setTableNumber(e.target.value)}
          placeholder="e.g. 5"
          className="qr-input"
        />
      </div>

      {qrUrl && (
        <>
          <div className="qr-canvas-wrap">
            <QRCodeCanvas
              id={QR_ID}
              value={qrUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="M"
            />
            <p className="qr-url">{qrUrl}</p>
          </div>

          <div className="qr-actions">
            <button className="qr-download-btn" onClick={downloadQR}>
              Download PNG
            </button>
            <button
              className={`qr-copy-btn${copied ? ' qr-copy-btn--copied' : ''}`}
              onClick={copyLink}
            >
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
