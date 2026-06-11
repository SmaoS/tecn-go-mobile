import { Text } from 'react-native'
import { NearbyMap } from '../../../components/NearbyMap'
import { Screen, styles } from '../../../components/UI'

export function NearbyTechniciansScreen() {
  return <Screen><Text style={styles.title}>Técnicos cercanos</Text><Text style={styles.subtitle}>Vista preparada para conectar geolocalización real.</Text><NearbyMap /></Screen>
}
