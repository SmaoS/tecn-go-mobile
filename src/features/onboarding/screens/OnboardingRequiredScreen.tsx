import { useQuery } from '@tanstack/react-query'
import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, styles } from '../../../components/UI'
import type { RootStackParamList } from '../../../types'
import { onboardingApi } from '../api'

const labels: Record<string, string> = {
  MAIN_DATA: 'Datos principales',
  LEGAL_ACCEPTANCE: 'Aceptar documentos legales',
  PROFILE_SELFIE: 'Foto de perfil',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  TECHNICIAN_CERTIFICATE: 'Certificado técnico opcional',
  COMPLETED: 'Listo para completar',
}

export function OnboardingRequiredScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'OnboardingRequired'>) {
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status })
  return <Card>
    <Text style={styles.title}>Completa tu inscripción</Text>
    <Text style={styles.muted}>Antes de operar en TecnGo necesitamos completar tu información básica, documentos y términos.</Text>
    <Text style={styles.label}>Paso actual</Text>
    <Text style={styles.cardTitle}>{labels[status.data?.currentStep ?? 'MAIN_DATA']}</Text>
    <Button title="Ir a Mi perfil" onPress={() => navigation.navigate('Profile')} />
    <Button title="Ver documentos legales" onPress={() => navigation.navigate('Legal')} />
  </Card>
}
