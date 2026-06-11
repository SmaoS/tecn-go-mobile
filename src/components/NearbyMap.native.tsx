import MapView, { Marker } from 'react-native-maps'
import { colors } from './UI'

export function NearbyMap() {
  return (
    <MapView
      style={{ flex: 1, borderRadius: 18 }}
      initialRegion={{
        latitude: 4.711,
        longitude: -74.0721,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      <Marker
        coordinate={{ latitude: 4.711, longitude: -74.0721 }}
        title="Tu ubicación"
        pinColor={colors.brand}
      />
    </MapView>
  )
}
