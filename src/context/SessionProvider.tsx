import { useQueryClient } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '../api/client'
import { usePushRegistration } from '../features/notifications/usePushRegistration'
import { technicianApi } from '../features/technician/api'
import type { Session } from '../types'
import { locationTrackingService } from '../services/LocationTrackingService'
import { SessionContext } from './session-context'
import { api } from '../api/client'
import { showToast } from '../components/Toast'
import { getStoredSession, removeStoredSession, setStoredSession } from '../services/sessionStorage'
import { setObservedUser } from '../services/observability'
import { normalizeSession } from '../features/auth/api'

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getStoredSession()
      .then(async (raw) => {
        if (!raw) return
        const restored = normalizeSession(JSON.parse(raw) as Session)
        setSession(restored)
        if (JSON.stringify(restored) !== raw) {
          await setStoredSession(JSON.stringify(restored))
        }
      })
      .finally(() => setReady(true))
  }, [])
  useEffect(() => setUnauthorizedHandler(() => {
    setSession(null)
    queryClient.clear()
  }), [queryClient])
  useEffect(() => setObservedUser(session?.userId, session?.activeMode ?? session?.role), [session])
  usePushRegistration(session?.userId)

  async function switchMode(mode: 'CLIENT' | 'TECHNICIAN') {
    if (!session || session.activeMode === mode) return
    if (session.activeMode === 'TECHNICIAN') {
      await locationTrackingService.stopTracking(false)
    }
    const { data } = await api.put<{
      token: string
      roles: Session['roles']
      activeMode: 'CLIENT' | 'TECHNICIAN'
      roleCreated: boolean
      onboardingCompleted: boolean
    }>('/v1/users/me/active-mode', { mode })
    const next: Session = {
      ...session,
      token: data.token,
      roles: data.roles,
      activeMode: data.activeMode,
      role: data.activeMode,
      onboardingCompleted: data.onboardingCompleted,
    }
    await setStoredSession(JSON.stringify(next))
    queryClient.clear()
    setSession(next)
    showToast(data.roleCreated
      ? mode === 'CLIENT' ? 'Modo cliente creado y activado' : 'Modo técnico creado. Completa tu inscripción'
      : mode === 'CLIENT' ? 'Modo cliente activado' : 'Modo técnico activado')
  }

  async function logout() {
    if (session?.role === 'TECHNICIAN') {
      await locationTrackingService.stopTracking(false)
      try {
        const location = await Location.getLastKnownPositionAsync()
        if (location) await technicianApi.location({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          online: false,
        })
      } catch {
        // Logout continues if the final location update is unavailable.
      }
    }
    try {
      await api.post('/v1/auth/logout')
    } catch {
      // Local logout must continue when the backend is unavailable.
    }
    await removeStoredSession()
    queryClient.clear()
    setSession(null)
  }

  const value = useMemo(() => ({ session, ready, setSession, switchMode, logout }), [session, ready])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
