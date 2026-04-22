import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface Props {
  children:     ReactNode
  requiredRole: UserRole
}

export default function AuthGuard({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user)                    return <Navigate to="/login" replace />
  if (user.role !== requiredRole) return <Navigate to="/" replace />

  return <>{children}</>
}
