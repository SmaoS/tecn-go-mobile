import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import { NearbyMap } from '../../../components/NearbyMap'
import { Button, Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { useCurrentLocation, type Coordinates } from '../../location/hooks'
import { useNearbyTechnicians } from '../hooks'

export function NearbyTechniciansScreen() {
  const location = useCurrentLocation()
  const [coordinates, setCoordinates] = useState<Coordinates>()
  useEffect(() => { void location.getCurrent().then((value) => value && setCoordinates(value)) }, [])
  const technicians = useNearbyTechnicians(coordinates?.latitude, coordinates?.longitude)
  return <KeyboardAwareScreen><Text style={styles.title}>Técnicos cercanos</Text><Text style={styles.subtitle}>Técnicos en línea alrededor de tu ubicación actual.</Text>
    <Button title={location.isLocating ? 'Ubicando...' : 'Volver a ubicarme'} loading={location.isLocating} onPress={() => void location.getCurrent().then((value) => value && setCoordinates(value))} />
    {(location.error || technicians.error) && <Text style={styles.error}>{location.error || 'No fue posible consultar técnicos cercanos.'}</Text>}
    <View style={{ flex: 1, minHeight: 260, marginVertical: 12 }}><NearbyMap client={coordinates} technicians={technicians.data ?? []} /></View>
    {(technicians.data ?? []).slice(0, 3).map((item) => <Card key={item.technicianId}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>{item.profilePhotoUrl && <Image source={{ uri: item.profilePhotoUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} />}<View><Text style={styles.cardTitle}>{item.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {item.averageRating.toFixed(1)} · {item.distanceKm.toFixed(1)} km</Text></View></View></Card>)}
  </KeyboardAwareScreen>
}
