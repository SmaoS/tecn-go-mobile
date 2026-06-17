import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Field, styles } from '../../../components/UI'
import { SecureField } from '../../../components/SecureField'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { RootStackParamList, Session } from '../../../types'
import { useForgotPassword, useLogin, useRegister, useResetPassword } from '../hooks'
import { authApi } from '../api'

type Props = NativeStackScreenProps<RootStackParamList, 'Login' | 'Register'> & {
  onSession: (session: Session) => void
}

export function LoginScreen({ navigation, onSession }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin(onSession)
  const canLogin = email.trim().length > 0 && password.length > 0
  return <KeyboardAwareScreen><Text style={styles.title}>TecnGo</Text><Text style={styles.subtitle}>Ayuda técnica cerca de ti.</Text>
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={email} onChangeText={setEmail} />
    <SecureField placeholder="Contraseña" value={password} onChangeText={setPassword} />
    {login.error && <Text style={styles.error}>{apiMessage(login.error)}</Text>}<Button title="Ingresar" onPress={() => login.mutate({ email: email.trim(), password })} loading={login.isPending} disabled={!canLogin} />
    <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.link}>¿Olvidaste tu contraseña?</Text></Pressable>
    <Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Crear una cuenta</Text></Pressable>
  </KeyboardAwareScreen>
}

export function RegisterScreen({ navigation, onSession }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [role, setRole] = useState<'CLIENT' | 'TECHNICIAN'>('CLIENT')
  const [referralCode, setReferralCode] = useState('')
  const [referralMessage, setReferralMessage] = useState('')
  const register = useRegister(onSession)
  return <KeyboardAwareScreen contentContainerStyle={authStyles.registerContent} keyboardVerticalOffset={20}><Text style={styles.title}>Crea tu cuenta</Text><Text style={styles.subtitle}>Solicita tu primer servicio en minutos.</Text>
    <Text style={styles.label}>Tipo de cuenta</Text>
    <View style={authStyles.roleRow}>
      <Pressable style={[authStyles.roleButton, role === 'CLIENT' && authStyles.roleButtonActive]} onPress={() => setRole('CLIENT')}><Text style={[authStyles.roleText, role === 'CLIENT' && authStyles.roleTextActive]}>Cliente {role === 'CLIENT' ? '✓' : ''}</Text></Pressable>
      <Pressable style={[authStyles.roleButton, role === 'TECHNICIAN' && authStyles.roleButtonActive]} onPress={() => setRole('TECHNICIAN')}><Text style={[authStyles.roleText, role === 'TECHNICIAN' && authStyles.roleTextActive]}>Técnico {role === 'TECHNICIAN' ? '✓' : ''}</Text></Pressable>
    </View>
    <Field placeholder="Nombre completo" value={form.fullName} onChangeText={(fullName) => setForm({ ...form, fullName })} />
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
    <SecureField placeholder="Contraseña" value={form.password} onChangeText={(password) => setForm({ ...form, password })} />
    <SecureField placeholder="Confirmar contraseña" value={form.confirmPassword} onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })} />
    <Field autoCapitalize="characters" placeholder="Código de referido (opcional)" value={referralCode} onChangeText={(value) => { setReferralCode(value.toUpperCase()); setReferralMessage('') }} onBlur={() => {
      if (referralCode.trim()) void authApi.validateReferral(referralCode.trim()).then((value) => setReferralMessage(value.message)).catch(() => setReferralMessage('No fue posible validar el código.'))
    }} />
    {referralMessage && <Text style={styles.muted}>{referralMessage}</Text>}
    <Text style={styles.muted}>Al ingresar podrás completar el perfil y subir el documento para verificación.</Text>
    {form.confirmPassword && form.password !== form.confirmPassword && <Text style={styles.error}>Las contraseñas no coinciden</Text>}
    {register.error && <Text style={styles.error}>{apiMessage(register.error)}</Text>}<Button title="Registrarme" onPress={() => {
      if (form.password !== form.confirmPassword) return
      register.mutate({ ...form, role, referralCode: referralCode.trim() || undefined })
    }} loading={register.isPending} />
    <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Ya tengo cuenta</Text></Pressable>
  </KeyboardAwareScreen>
}

const authStyles = StyleSheet.create({
  registerContent: { paddingBottom: 220 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  roleButton: { flex: 1, borderColor: '#1e293b', borderRadius: 14, borderWidth: 1, paddingVertical: 12 },
  roleButtonActive: { borderColor: '#22d3ee', backgroundColor: '#083344' },
  roleText: { color: '#94a3b8', fontWeight: '800', textAlign: 'center' },
  roleTextActive: { color: '#22d3ee' },
})

export function ForgotPasswordScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>) {
  const [email, setEmail] = useState('')
  const forgot = useForgotPassword()
  return <KeyboardAwareScreen>
    <Text style={styles.title}>Recuperar contraseña</Text>
    <Text style={styles.subtitle}>Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.</Text>
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={email} onChangeText={setEmail} />
    {forgot.data && <Text style={styles.muted}>{forgot.data.message}</Text>}
    {forgot.error && <Text style={styles.error}>{apiMessage(forgot.error)}</Text>}
    <Button title="Enviar instrucciones" onPress={() => forgot.mutate(email)} loading={forgot.isPending} />
    <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Volver al inicio de sesión</Text></Pressable>
  </KeyboardAwareScreen>
}

export function ResetPasswordScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'ResetPassword'>) {
  const token = route.params?.token ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const reset = useResetPassword()
  return <KeyboardAwareScreen>
    <Text style={styles.title}>Nueva contraseña</Text>
    {!token && <Text style={styles.error}>Abre esta pantalla desde el enlace enviado a tu correo.</Text>}
    <SecureField placeholder="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} />
    <SecureField placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} />
    {confirmPassword && newPassword !== confirmPassword && <Text style={styles.error}>Las contraseñas no coinciden</Text>}
    {reset.data && <Text style={styles.muted}>{reset.data.message}</Text>}
    {reset.error && <Text style={styles.error}>{apiMessage(reset.error)}</Text>}
    <Button title="Cambiar contraseña" onPress={() => {
      if (!token || newPassword !== confirmPassword) return
      reset.mutate({ token, newPassword, confirmPassword }, { onSuccess: () => navigation.replace('Login') })
    }} loading={reset.isPending} />
  </KeyboardAwareScreen>
}
