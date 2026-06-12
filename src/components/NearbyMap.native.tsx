import MapView, { Marker } from 'react-native-maps'
import { colors } from './UI'
import type { NearbyTechnician } from '../types'
import type { Coordinates } from '../features/location/hooks'

export function NearbyMap({ client, technicians }: { client?: Coordinates; technicians: NearbyTechnician[] }) {
  const center = client ?? { latitude: 4.711, longitude: -74.0721 }
  return (
    <MapView
      style={{ flex: 1, borderRadius: 18 }}
      region={{
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      {client && <Marker coordinate={client} title="Tu ubicación" pinColor={colors.brand} />}
      {technicians.map((item) => <Marker key={item.technicianId} coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.technicianName} description={`${item.distanceKm.toFixed(1)} km · ★ ${item.averageRating.toFixed(1)}`} />)}
    </MapView>
  )
}
