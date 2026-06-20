import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import type { Coordinates } from '../features/location/hooks'
import { colors } from './UI'

export function RoutePreviewMap({ origin, destination, distanceKm }: {
  origin?: Coordinates
  destination?: Coordinates
  distanceKm?: number
}) {
  const map = useRef<MapView>(null)
  const [route, setRoute] = useState<Coordinates[]>([])
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>()
  const [routeDurationMinutes, setRouteDurationMinutes] = useState<number>()
  const [routeError, setRouteError] = useState('')
  const mapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    const points = route.length > 1 ? route : origin && destination ? [origin, destination] : []
    if (points.length < 2) return
    const timer = setTimeout(() => map.current?.fitToCoordinates(points, {
      animated: true,
      edgePadding: { top: 54, right: 46, bottom: 54, left: 46 },
    }), 200)
    return () => clearTimeout(timer)
  }, [destination, origin, route])

  useEffect(() => {
    if (!origin || !destination || !mapsApiKey) {
      setRoute([])
      return
    }
    const controller = new AbortController()
    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: 'driving',
      alternatives: 'true',
      language: 'es',
      key: mapsApiKey,
    })
    void fetch(`https://maps.googleapis.com/maps/api/directions/json?${params}`, {
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('No fue posible consultar la ruta vial.')
      const data = await response.json() as DirectionsResponse
      if (data.status !== 'OK' || data.routes.length === 0) {
        throw new Error(data.error_message ?? 'No se encontró una ruta vial disponible.')
      }
      const selected = [...data.routes].sort((left, right) =>
        routeDuration(left) - routeDuration(right))[0]
      if (!selected) throw new Error('No se encontró una ruta vial disponible.')
      setRoute(decodePolyline(selected.overview_polyline.points))
      setRouteDistanceKm(routeDistance(selected) / 1000)
      setRouteDurationMinutes(Math.max(1, Math.round(routeDuration(selected) / 60)))
      setRouteError('')
    }).catch((reason: unknown) => {
      if (reason instanceof Error && reason.name === 'AbortError') return
      setRoute([])
      setRouteDistanceKm(undefined)
      setRouteDurationMinutes(undefined)
      setRouteError(reason instanceof Error ? reason.message : 'No fue posible consultar la ruta vial.')
    })
    return () => controller.abort()
  }, [destination?.latitude, destination?.longitude, mapsApiKey, origin?.latitude, origin?.longitude])

  if (!origin || !destination) {
    return <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>Preparando recorrido...</Text>
      <Text style={styles.placeholderText}>Activa la ubicación para visualizar el trayecto.</Text>
    </View>
  }

  return <View style={styles.container}>
    <MapView ref={map} style={styles.map} initialRegion={{
      latitude: (origin.latitude + destination.latitude) / 2,
      longitude: (origin.longitude + destination.longitude) / 2,
      latitudeDelta: Math.max(Math.abs(origin.latitude - destination.latitude) * 1.8, 0.025),
      longitudeDelta: Math.max(Math.abs(origin.longitude - destination.longitude) * 1.8, 0.025),
    }}>
      <Marker coordinate={origin} title="Tu ubicación actual" pinColor={colors.brand} />
      <Marker coordinate={destination} title="Zona aproximada del servicio" />
      <Polyline
        coordinates={route.length > 1 ? route : [origin, destination]}
        strokeColor={colors.brand}
        strokeWidth={4}
        lineDashPattern={route.length > 1 ? undefined : [10, 7]}
      />
    </MapView>
    {(routeDistanceKm != null || distanceKm != null) && <View style={styles.distanceBadge}>
      <Text style={styles.distanceText}>{routeDistanceKm != null ? '' : '~'}{(routeDistanceKm ?? distanceKm)!.toLocaleString('es-CO', { maximumFractionDigits: 1 })} km</Text>
      {routeDurationMinutes != null && <Text style={styles.durationText}>{routeDurationMinutes} min</Text>}
    </View>}
    {routeError && <View style={styles.errorBadge}><Text style={styles.errorText}>Ruta aproximada</Text></View>}
  </View>
}

interface DirectionsRoute {
  overview_polyline: { points: string }
  legs: Array<{ distance: { value: number }; duration: { value: number } }>
}

interface DirectionsResponse {
  status: string
  error_message?: string
  routes: DirectionsRoute[]
}

function routeDistance(route: DirectionsRoute) {
  return route.legs.reduce((total, leg) => total + leg.distance.value, 0)
}

function routeDuration(route: DirectionsRoute) {
  return route.legs.reduce((total, leg) => total + leg.duration.value, 0)
}

function decodePolyline(encoded: string): Coordinates[] {
  const points: Coordinates[] = []
  let index = 0
  let latitude = 0
  let longitude = 0
  while (index < encoded.length) {
    const latitudeResult = decodeValue(encoded, index)
    index = latitudeResult.index
    latitude += latitudeResult.value
    const longitudeResult = decodeValue(encoded, index)
    index = longitudeResult.index
    longitude += longitudeResult.value
    points.push({ latitude: latitude / 1e5, longitude: longitude / 1e5 })
  }
  return points
}

function decodeValue(encoded: string, start: number) {
  let result = 0
  let shift = 0
  let index = start
  let byte: number
  do {
    byte = encoded.charCodeAt(index++) - 63
    result |= (byte & 0x1f) << shift
    shift += 5
  } while (byte >= 0x20 && index < encoded.length)
  return { index, value: result & 1 ? ~(result >> 1) : result >> 1 }
}

const styles = StyleSheet.create({
  container: { height: 230, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { flex: 1 },
  placeholder: { height: 230, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24 },
  placeholderTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  placeholderText: { color: colors.muted, marginTop: 8, textAlign: 'center' },
  distanceBadge: { position: 'absolute', right: 12, top: 12, borderRadius: 12, backgroundColor: 'rgba(2,8,23,.88)', paddingHorizontal: 12, paddingVertical: 7 },
  distanceText: { color: colors.brand, fontWeight: '900' },
  durationText: { color: colors.text, fontSize: 11, fontWeight: '800', marginTop: 2, textAlign: 'right' },
  errorBadge: { position: 'absolute', left: 12, bottom: 12, borderRadius: 10, backgroundColor: 'rgba(2,8,23,.82)', paddingHorizontal: 10, paddingVertical: 6 },
  errorText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
})
