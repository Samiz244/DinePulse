import { useRef, useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../services/supabaseClient'
import type { Restaurant } from '../types'

interface RestaurantTable {
  id:            string
  restaurant_id: string
  name:          string
  sort_order:    number
  created_at:    string
}

interface QRPanelProps {
  restaurant: Restaurant
}

const QR_SIZE = 180

// ── SVG → PNG download helper ────────────────────────────────
function downloadSvgAsPng(container: HTMLDivElement, filename: string) {
  const svg = container.querySelector('svg')
  if (!svg) return
  const svgData = new XMLSerializer().serializeToString(svg)
  const blobUrl = URL.createObjectURL(
    new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }),
  )
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = QR_SIZE
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, QR_SIZE, QR_SIZE)
    ctx.drawImage(img, 0, 0, QR_SIZE, QR_SIZE)
    URL.revokeObjectURL(blobUrl)
    const a = document.createElement('a')
    a.href     = canvas.toDataURL('image/png')
    a.download = filename
    a.click()
  }
  img.src = blobUrl
}

// ── TableCard sub-component (owns its own ref) ───────────────
interface TableCardProps {
  table:        RestaurantTable
  qrUrl:        string
  editingId:    string | null
  editingName:  string
  onStartEdit:  (id: string, name: string) => void
  onChangeName: (name: string) => void
  onSaveName:   (id: string) => void
  onCancelEdit: () => void
  onDelete:     (id: string) => void
}

function TableCard({
  table, qrUrl,
  editingId, editingName,
  onStartEdit, onChangeName, onSaveName, onCancelEdit,
  onDelete,
}: TableCardProps) {
  const qrRef    = useRef<HTMLDivElement>(null)
  const isEditing = editingId === table.id

  function handleDownload() {
    if (!qrRef.current) return
    const safe = table.name.replace(/\s+/g, '_')
    downloadSvgAsPng(qrRef.current, `${safe}_QR.png`)
  }

  return (
    <div className="qrt-card">

      {/* Card header: name + action buttons */}
      <div className="qrt-card-header">
        {isEditing ? (
          <input
            className="qrt-name-input"
            value={editingName}
            onChange={e => onChangeName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  onSaveName(table.id)
              if (e.key === 'Escape') onCancelEdit()
            }}
            onBlur={() => onSaveName(table.id)}
            autoFocus
          />
        ) : (
          <span className="qrt-table-name">{table.name}</span>
        )}
        <div className="qrt-card-btns">
          {!isEditing && (
            <button
              className="qrt-edit-btn"
              onClick={() => onStartEdit(table.id, table.name)}
              aria-label={`Rename ${table.name}`}
            >
              ✏
            </button>
          )}
          <button
            className="qrt-delete-btn"
            onClick={() => onDelete(table.id)}
            aria-label={`Delete ${table.name}`}
          >
            ✕
          </button>
        </div>
      </div>

      {/* QR code */}
      <div className="qrt-qr-wrap" ref={qrRef}>
        <QRCodeSVG
          value={qrUrl}
          size={QR_SIZE}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          marginSize={1}
        />
      </div>

      {/* Download */}
      <button className="qrt-download-btn" onClick={handleDownload}>
        Download PNG
      </button>

    </div>
  )
}

// ── QRPanel ──────────────────────────────────────────────────
export default function QRPanel({ restaurant }: QRPanelProps) {
  const [tables,        setTables]        = useState<RestaurantTable[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [fetchError,    setFetchError]    = useState<string | null>(null)
  const [bulkCount,     setBulkCount]     = useState('1')
  const [generating,    setGenerating]    = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [editingId,     setEditingId]     = useState<string | null>(null)
  const [editingName,   setEditingName]   = useState('')

  async function fetchTables() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, restaurant_id, name, sort_order, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })

    if (error) {
      setFetchError('Failed to load tables.')
    } else {
      setTables(data ?? [])
      setFetchError(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTables()
  }, [restaurant.id])

  async function handleBulkGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const count = parseInt(bulkCount)
    if (isNaN(count) || count < 1 || count > 100) return

    setGenerating(true)
    setGenerateError(null)

    const startNum    = tables.length + 1
    const maxSort     = tables.length > 0
      ? Math.max(...tables.map(t => t.sort_order))
      : -1

    const rows = Array.from({ length: count }, (_, i) => ({
      restaurant_id: restaurant.id,
      name:          `Table ${startNum + i}`,
      sort_order:    maxSort + 1 + i,
    }))

    const { error } = await supabase.from('restaurant_tables').insert(rows)

    setGenerating(false)

    if (error) {
      setGenerateError('Failed to generate tables. Please try again.')
      return
    }

    setBulkCount('1')
    fetchTables()
  }

  async function handleDeleteTable(tableId: string) {
    if (!window.confirm('Delete this table? Its QR code will stop working.')) return

    const { error } = await supabase
      .from('restaurant_tables')
      .delete()
      .eq('id', tableId)
      .eq('restaurant_id', restaurant.id)

    if (error) {
      setFetchError('Failed to delete table.')
      return
    }

    fetchTables()
  }

  async function handleSaveTableName(tableId: string) {
    const name = editingName.trim()
    setEditingId(null)
    if (!name) return

    await supabase
      .from('restaurant_tables')
      .update({ name })
      .eq('id', tableId)
      .eq('restaurant_id', restaurant.id)

    fetchTables()
  }

  if (!restaurant.slug) {
    return (
      <div className="qr-panel">
        <p className="qr-title">Table QR Codes</p>
        <div className="qr-no-slug">
          Please set a restaurant slug in Settings to generate QR codes.
        </div>
      </div>
    )
  }

  const origin = window.location.origin

  return (
    <div className="qr-panel qr-panel--wide">
      <p className="qr-title">Table QR Codes</p>
      <p className="qr-sub">
        Generate a QR code for each table. Customers scan to open your menu
        with their table pre-selected.
      </p>

      {/* ── Bulk generate ──────────────────────────────────── */}
      <form className="qrt-generate-form" onSubmit={handleBulkGenerate}>
        <label htmlFor="qrt-count" className="qr-sub" style={undefined}>
          Tables to add
        </label>
        <div className="qrt-generate-row">
          <input
            id="qrt-count"
            type="number"
            min="1"
            max="100"
            value={bulkCount}
            onChange={e => setBulkCount(e.target.value)}
            className="qrt-count-input"
          />
          <button
            type="submit"
            disabled={generating}
            className="qr-download-btn"
          >
            {generating ? 'Generating…' : 'Generate Tables'}
          </button>
        </div>
        {generateError && <p className="mp-error">{generateError}</p>}
      </form>

      {/* ── Table grid ─────────────────────────────────────── */}
      {fetchError && <p className="mp-error">{fetchError}</p>}

      {isLoading ? (
        <p className="mp-loading">Loading tables…</p>
      ) : tables.length === 0 ? (
        <div className="mp-empty">
          <p className="mp-empty-icon">🪑</p>
          <p className="mp-empty-title">No tables yet</p>
          <p className="mp-empty-sub">
            Use "Generate Tables" above to create your first QR codes.
          </p>
        </div>
      ) : (
        <div className="qrt-grid">
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              qrUrl={`${origin}/restaurant/${restaurant.slug}?table=${table.id}`}
              editingId={editingId}
              editingName={editingName}
              onStartEdit={(id, name) => { setEditingId(id); setEditingName(name) }}
              onChangeName={setEditingName}
              onSaveName={handleSaveTableName}
              onCancelEdit={() => setEditingId(null)}
              onDelete={handleDeleteTable}
            />
          ))}
        </div>
      )}
    </div>
  )
}
