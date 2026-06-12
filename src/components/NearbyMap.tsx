import { StyleSheet, Text, View } from 'react-native'
import { colors } from './UI'
import type { NearbyTechnician } from '../types'
import type { Coordinates } from '../features/location/hooks'

export function NearbyMap(_: { client?: Coordinates; technicians: NearbyTechnician[] }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>Mapa no disponible en esta plataforma</Text>
      <Text style={styles.description}>
        Usa Android o iOS para consultar técnicos cercanos en el mapa.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.card,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
})
