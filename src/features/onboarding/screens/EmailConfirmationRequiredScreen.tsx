import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles } from '../../../components/UI'
import { useSession } from '../../../context/useSession'
import type { RootStackParamList } from '../../../types'
import { onboardingApi } from '../api'
import { apiMessage } from '../../../shared/apiMessage'
import { showToast } from '../../../components/Toast'

export function EmailConfirmationRequiredScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'EmailConfirmationRequired'>) {
  const { session, setSession, logout } = useSession()
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({ email: session?.email ?? '', confirmEmail: '' })
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, retry: false })
  const resend = useMutation({ mutationFn: onboardingApi.resendEmail })
  const updateEmail = useMutation({
    mutationFn: onboardingApi.updateEmail,
    onSuccess: (data) => {
      if (session) setSession({ ...session, email: data.email, emailVerified: data.emailVerified })
      setEmailForm({ email: data.email, confirmEmail: '' })
      setEditingEmail(false)
      showToast('Correo actualizado. Enviamos un nuevo enlace de verificación.')
    },
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const emailsMatch = emailForm.email.trim().toLowerCase() === emailForm.confirmEmail.trim().toLowerCase()
  return <Card>
    <Text style={styles.title}>Confirma tu correo</Text>
    <Text style={styles.muted}>Debes confirmar tu correo electrónico para continuar usando TecnGo.</Text>
    <Card>
      <Text style={styles.muted}>Correo actual</Text>
      <Text style={[styles.cardTitle, { marginTop: 6 }]}>{session?.email ?? 'No hay correo registrado'}</Text>
      {!editingEmail && <Button title="Modificar correo" onPress={() => {
        setEmailForm({ email: session?.email ?? '', confirmEmail: '' })
        setEditingEmail(true)
      }} />}
    </Card>
    {editingEmail && <Card>
      <Text style={styles.cardTitle}>Actualizar correo</Text>
      <Field
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Nuevo correo"
        value={emailForm.email}
        onChangeText={(email) => setEmailForm({ ...emailForm, email })}
      />
      <Field
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Confirmar nuevo correo"
        value={emailForm.confirmEmail}
        onChangeText={(confirmEmail) => setEmailForm({ ...emailForm, confirmEmail })}
      />
      {emailForm.confirmEmail && !emailsMatch && <Text style={styles.error}>Los correos no coinciden</Text>}
      <Button
        title="Actualizar correo"
        loading={updateEmail.isPending}
        disabled={!emailForm.email.trim() || !emailsMatch}
        onPress={() => updateEmail.mutate(emailForm)}
      />
      <Button title="Cancelar" onPress={() => setEditingEmail(false)} />
    </Card>}
    <Button title="Reenviar correo" onPress={() => resend.mutate()} loading={resend.isPending} />
    <Button title="Ya confirmé mi correo" onPress={() => void status.refetch().then((result) => {
      if (result.data?.emailVerified || result.data?.phoneVerified) navigation.replace(result.data.onboardingCompleted ? 'Home' : 'OnboardingRequired')
    })} />
    <Button title="Cerrar sesión" onPress={logout} />
    {resend.isSuccess && <Text style={styles.muted}>Correo enviado.</Text>}
  </Card>
}
