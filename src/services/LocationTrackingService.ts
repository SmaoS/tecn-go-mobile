import * as Location from 'expo-location'
import { technicianApi } from '../features/technician/api'

class LocationTrackingService {
  private subscription: Location.LocationSubscription | null = null
  private starting: Promise<void> | null = null

  isTracking() {
    return this.subscription !== null || this.starting !== null
  }

  async startTracking() {
    if (this.subscription || this.starting) return this.starting
    this.starting = this.createSubscription()
    try {
      await this.starting
    } finally {
      this.starting = null
    }
  }

  async stopTracking(markOffline = true) {
    this.pauseTracking()
    if (!markOffline) return
    const location = await Location.getLastKnownPositionAsync()
    if (location) await this.updateBackendLocation(location, false)
  }

  pauseTracking() {
    this.subscription?.remove()
    this.subscription = null
  }

  async updateBackendLocation(location: Location.LocationObject, online = true) {
    await technicianApi.location({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      online,
    })
  }

  private async createSubscription() {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted) throw new Error('Debes permitir la ubicación para aparecer disponible')
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    await this.updateBackendLocation(current, true)
    this.subscription = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10_000,
      distanceInterval: 20,
    }, (location) => {
      void this.updateBackendLocation(location).catch(() => {
        // The next GPS update retries while the watcher remains active.
      })
    })
  }
}

export const locationTrackingService = new LocationTrackingService()
