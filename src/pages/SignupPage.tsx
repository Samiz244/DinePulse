import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

export default function SignupPage() {
  const { user } = useAuth()
  if (user?.role === 'manager') return <Navigate to="/admin" replace />

  return <AuthModal isOpen={true} onClose={() => {}} />
}
