import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setStoredToken, getStoredToken } from '../lib/api'
import type { User, Role } from '../lib/env'

type AuthContextValue = {
  token: string | null
  user: User | null
  loading: boolean
  signup: (input: { name: string; email: string; password: string; role: Role }) => Promise<void>
  login: (input: { email: string; password: string }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  async function refreshMe() {
    const t = getStoredToken()
    if (!t) {
      setUser(null)
      return
    }
    const res = await api.get<{ user: User }>('/auth/me')
    setUser(res.data.user)
  }

  async function signup(input: { name: string; email: string; password: string; role: Role }) {
    const res = await api.post<{ token: string; user: User }>('/auth/signup', input)
    setStoredToken(res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
  }

  async function login(input: { email: string; password: string }) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', input)
    setStoredToken(res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (getStoredToken()) {
          await refreshMe()
        }
      } catch {
        // token invalid or backend down
        setStoredToken(null)
        setToken(null)
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, signup, login, logout, refreshMe }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
