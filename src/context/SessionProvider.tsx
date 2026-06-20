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

  const value = useMemo(() => ({ session, ready, setSession, logout }), [session, ready])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
