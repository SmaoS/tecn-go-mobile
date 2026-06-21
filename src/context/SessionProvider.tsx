import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQueryClient } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { SESSION_KEY, setUnauthorizedHandler } from '../api/client'
import { usePushRegistration } from '../features/notifications/usePushRegistration'
import { technicianApi } from '../features/technician/api'
import type { Session } from '../types'
import { locationTrackingService } from '../services/LocationTrackingService'
import { SessionContext } from './session-context'
import { api } from '../api/client'
import { showToast } from '../components/Toast'

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => { if (raw) setSession(JSON.parse(raw) as Session) })
      .finally(() => setReady(true))
  }, [])
  useEffect(() => setUnauthorizedHandler(() => {
    setSession(null)
    queryClient.clear()
  }), [queryClient])
  usePushRegistration(session?.userId)

  async function switchMode(mode: 'CLIENT' | 'TECHNICIAN') {
    if (!session || session.activeMode === mode) return
    if (!session.roles?.includes(mode)) throw new Error(`Tu cuenta no tiene el modo ${mode}`)
    if (session.activeMode === 'TECHNICIAN') {
      await locationTrackingService.stopTracking(false)
    }
    const { data } = await api.put<{
      token: string
      roles: Session['roles']
      activeMode: 'CLIENT' | 'TECHNICIAN'
    }>('/v1/users/me/active-mode', { mode })
    const next: Session = {
      ...session,
      token: data.token,
      roles: data.roles,
      activeMode: data.activeMode,
      role: data.activeMode,
    }
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next))
    queryClient.clear()
    setSession(next)
    showToast(mode === 'CLIENT' ? 'Modo cliente activado' : 'Modo técnico activado')
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
    await AsyncStorage.removeItem(SESSION_KEY)
    queryClient.clear()
    setSession(null)
  }

  const value = useMemo(() => ({ session, ready, setSession, switchMode, logout }), [session, ready])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
