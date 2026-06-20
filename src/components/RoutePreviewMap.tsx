import { StyleSheet, Text, View } from 'react-native'
import type { Coordinates } from '../features/location/hooks'
import { colors } from './UI'

export function RoutePreviewMap(_: {
  origin?: Coordinates
  destination?: Coordinates
  distanceKm?: number
}) {
  return <View style={styles.placeholder}>
    <Text style={styles.title}>Vista de recorrido disponible en Android y iOS</Text>
  </View>
}

const styles = StyleSheet.create({
  placeholder: { height: 230, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24 },
  title: { color: colors.muted, textAlign: 'center' },
})
