import * as Location from 'expo-location'
import { useCallback, useEffect, useState } from 'react'
import { Linking, Platform } from 'react-native'
import { apiMessage } from '../../shared/apiMessage'
import { technicianApi } from '../technician/api'

export interface Coordinates {
  latitude: number
  longitude: number
  address?: string
}

export async function reverseGeocodeCoordinates(coordinates: Coordinates) {
  const [place] = await Location.reverseGeocodeAsync(coordinates)
  if (!place) return ''
  return [
    place.street,
    place.streetNumber,
    place.district,
    place.subregion,
    place.city,
  ].filter(Boolean).join(', ')
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
      const servicesEnabled = await Location.hasServicesEnabledAsync()
      if (!servicesEnabled) {
        if (Platform.OS === 'android') {
          try {
            await Location.enableNetworkProviderAsync()
          } catch {
            setError('Activa el GPS del dispositivo para crear la solicitud.')
            return null
          }
        } else {
          setError('Activa la ubicación del dispositivo para crear la solicitud.')
          void Linking.openSettings().catch(() => undefined)
          return null
        }
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const coordinates = { latitude: location.coords.latitude, longitude: location.coords.longitude }
      const address = await reverseGeocodeCoordinates(coordinates).catch(() => '')
      return { ...coordinates, address }
    } catch (reason) {
      setError(apiMessage(reason))
      return null
    } finally {
      setIsLocating(false)
    }
  }, [])
  return { getCurrent, isLocating, error, clearError: () => setError('') }
}

export function useLiveCurrentLocation(enabled: boolean) {
  const [coordinates, setCoordinates] = useState<Coordinates>()
  const [error, setError] = useState('')
  const [isLocating, setIsLocating] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setIsLocating(false)
      return
    }
    let active = true
    let subscription: Location.LocationSubscription | undefined

    const start = async () => {
      setIsLocating(true)
      setError('')
      try {
        const permission = await Location.requestForegroundPermissionsAsync()
        if (!permission.granted) {
          if (active) setError('Debes permitir la ubicación para consultar el recorrido.')
          return
        }
        subscription = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 10_000,
          distanceInterval: 10,
        }, (location) => {
          if (!active) return
          setCoordinates({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          })
          setIsLocating(false)
        })
      } catch (reason) {
        if (active) setError(apiMessage(reason))
      } finally {
        if (active && !subscription) setIsLocating(false)
      }
    }

    void start()
    return () => {
      active = false
      subscription?.remove()
    }
  }, [enabled])

  return { coordinates, error, isLocating }
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
