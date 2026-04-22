import { Routes, Route } from 'react-router-dom'
import AuthGuard      from './guards/AuthGuard'
import StaffGuard     from './guards/StaffGuard'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import AdminDashboard from './pages/AdminDashboard'
import StaffEntry     from './pages/StaffEntry'
import StaffDashboard from './pages/StaffDashboard'
import RestaurantPage from './pages/RestaurantPage'
import NotFound       from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/admin" element={
        <AuthGuard requiredRole="manager"><AdminDashboard /></AuthGuard>
      } />

      <Route path="/staff"           element={<StaffEntry />} />
      <Route path="/staff/dashboard" element={
        <StaffGuard><StaffDashboard /></StaffGuard>
      } />

      <Route path="/restaurant/:slug" element={<RestaurantPage />} />
      <Route path="*"                 element={<NotFound />} />
    </Routes>
  )
}
