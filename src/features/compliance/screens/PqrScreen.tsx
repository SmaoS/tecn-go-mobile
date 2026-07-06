import { Text } from 'react-native'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { styles } from '../../../components/UI'
import { DataRightsCard } from '../components/DataRightsCard'
import type { RootStackParamList } from '../../../types'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

type Props = NativeStackScreenProps<RootStackParamList, 'Pqr'>

export function PqrScreen({ navigation }: Props) {
  return <KeyboardAwareScreen>    
    <Text style={styles.subtitle}>Solicitudes relacionadas con tus datos personales.</Text>
    <DataRightsCard onCaptureSelfie={() => navigation.navigate('CaptureProfilePhoto', { purpose: 'SELFIE_CHANGE_REQUEST' })} />
  </KeyboardAwareScreen>
}
