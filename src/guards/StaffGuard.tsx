import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { StaffSession } from '../types'

export const STAFF_SESSION_KEY = 'dp_staff_session'

export function getStaffSession(): StaffSession | null {
  try {
    const raw = sessionStorage.getItem(STAFF_SESSION_KEY)
    return raw ? (JSON.parse(raw) as StaffSession) : null
  } catch { return null }
}

export function writeStaffSession(session: StaffSession): void {
  sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session))
}

export default function StaffGuard({ children }: { children: ReactNode }) {
  const session = getStaffSession()
  if (!session) return <Navigate to="/staff" replace />
  return <>{children}</>
}
