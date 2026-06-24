import { Text } from 'react-native'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { styles } from '../../../components/UI'
import { DataRightsCard } from '../components/DataRightsCard'

export function PqrScreen() {
  return <KeyboardAwareScreen>    
    <Text style={styles.subtitle}>Solicitudes relacionadas con tus datos personales.</Text>
    <DataRightsCard />
  </KeyboardAwareScreen>
}
