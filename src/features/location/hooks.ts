import * as Location from 'expo-location'
import { useCallback, useEffect, useState } from 'react'
import { apiMessage } from '../../shared/apiMessage'
import { technicianApi } from '../technician/api'

export interface Coordinates {
  latitude: number
  longitude: number
}

export function useCurrentLocation() {
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState('')
  const getCurrent = useCallback(async (): Promise<Coordinates | null> => {
    setIsLocating(true)
    setError('')
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) {
        setError('Permiso de ubicación denegado')
        return null
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      return { latitude: location.coords.latitude, longitude: location.coords.longitude }
    } catch (reason) {
      setError(apiMessage(reason))
      return null
    } finally {
      setIsLocating(false)
    }
  }, [])
  return { getCurrent, isLocating, error, clearError: () => setError('') }
}

export function useTechnicianLocationTracking(intervalMs = 10_000) {
  const [online, setOnline] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!online) return
    let active = true
    const send = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync()
        if (!permission.granted || !active) return
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        await technicianApi.location({
          latitude: location.coords.latitude, longitude: location.coords.longitude,
          accuracy: location.coords.accuracy, speed: location.coords.speed,
          heading: location.coords.heading, online: true,
        })
      } catch (reason) {
        if (active) setError(apiMessage(reason))
      }
    }
    void send()
    const interval = setInterval(() => void send(), intervalMs)
    return () => { active = false; clearInterval(interval) }
  }, [intervalMs, online])

  const toggle = useCallback(async () => {
    if (!online) {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) { setError('Debes permitir la ubicación'); return }
      setError('')
      setOnline(true)
      return
    }
    setOnline(false)
    const location = await Location.getLastKnownPositionAsync()
    if (location) await technicianApi.location({
      latitude: location.coords.latitude, longitude: location.coords.longitude, online: false,
    })
  }, [online])
  return { online, error, toggle }
}
