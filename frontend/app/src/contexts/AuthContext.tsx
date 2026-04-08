import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi, setAccessToken, type ApiUser } from '@lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'LEARNER' | 'ADMIN'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  emailVerified: boolean
  createdAt: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ message: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'avatarUrl'>>) => void
  deleteAccount: (password: string) => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapUser(u: ApiUser): AuthUser {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role === 'ADMIN' ? 'ADMIN' : 'LEARNER',
    avatarUrl: u.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true) // true on mount while restoring session

  // ── Restore session on mount via silent refresh ───────────────────────────
  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      try {
        // Try to get a new access token using the httpOnly refresh cookie
        const { accessToken } = await authApi.refresh()
        setAccessToken(accessToken)
        const me = await authApi.me()
        if (!cancelled) setUser(mapUser(me))
      } catch {
        // No valid session — user must log in
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    restoreSession()
    return () => { cancelled = true }
  }, [])

  // ── Listen for forced-logout event (from api.ts 401 retry failure) ────────
  useEffect(() => {
    const handler = () => {
      setAccessToken(null)
      setUser(null)
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { accessToken, user: apiUser } = await authApi.login(email, password)
      setAccessToken(accessToken)
      setUser(mapUser(apiUser))
      // Ping streak on login
      try { await fetch(`${import.meta.env.VITE_API_URL}/me/streak/ping`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, credentials: 'include' }) } catch { /* non-critical */ }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      return await authApi.register(name, email, password)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    setAccessToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates: Partial<Pick<AuthUser, 'name' | 'avatarUrl'>>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null)
  }, [])

  const deleteAccount = useCallback(async (password: string) => {
    setIsLoading(true)
    try {
      await authApi.deleteAccount(password)
      // Only clear local session if API succeeds
      setAccessToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
