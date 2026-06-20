import { useMutation, useQuery } from '@tanstack/react-query'
import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, styles } from '../../../components/UI'
import { useSession } from '../../../context/useSession'
import type { RootStackParamList } from '../../../types'
import { onboardingApi } from '../api'

export function EmailConfirmationRequiredScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'EmailConfirmationRequired'>) {
  const { logout } = useSession()
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, retry: false })
  const resend = useMutation({ mutationFn: onboardingApi.resendEmail })
  return <Card>
    <Text style={styles.title}>Confirma tu correo</Text>
    <Text style={styles.muted}>Debes confirmar tu correo electrónico para continuar usando TecnGo.</Text>
    <Button title="Reenviar correo" onPress={() => resend.mutate()} loading={resend.isPending} />
    <Button title="Ya confirmé mi correo" onPress={() => void status.refetch().then((result) => {
      if (result.data?.emailVerified || result.data?.phoneVerified) navigation.replace(result.data.onboardingCompleted ? 'Home' : 'OnboardingRequired')
    })} />
    <Button title="Cerrar sesión" onPress={logout} />
    {resend.isSuccess && <Text style={styles.muted}>Correo enviado.</Text>}
  </Card>
}
