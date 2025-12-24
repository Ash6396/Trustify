import React from 'react'
import { Navigate } from 'react-router-dom'
import Loading from './Loading'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../lib/env'

export default function ProtectedRoute({
  children,
  roles
}: {
  children: React.ReactNode
  roles?: Role[]
}) {
  const { user, loading } = useAuth()

  if (loading) return <Loading label="Checking session…" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
