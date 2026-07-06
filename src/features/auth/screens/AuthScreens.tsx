import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, colors, Field, styles } from '../../../components/UI'
import { SecureField } from '../../../components/SecureField'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { AppVersionCheck, RootStackParamList, Session } from '../../../types'
import { useForgotPassword, useLogin, useRegister, useRegisterByPhone, useResetPassword, useSendPhoneOtp, useVerifyAdminMfa, useVerifyPhoneOtp } from '../hooks'
import { authApi } from '../api'
import { AppVersionModal, checkAppVersionBeforeLogin } from '../../app-version/AppVersionGate'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../../../shared/phone'

type Props = NativeStackScreenProps<RootStackParamList, 'Login' | 'Register'> & {
  onSession: (session: Session) => void
}

export function LoginScreen({ navigation, onSession }: Props) {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [mfaChallenge, setMfaChallenge] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [versionCheck, setVersionCheck] = useState<AppVersionCheck>()
  const [checkingVersion, setCheckingVersion] = useState(false)
  const login = useLogin()
  const verifyMfa = useVerifyAdminMfa(onSession)
  const canLogin = (method === 'email' ? identifier.trim().length > 0 : isValidLocalPhone(identifier)) && password.length > 0
  const submitLogin = () => login.mutate(
    { identifier: method === 'phone' ? normalizeLocalPhone(identifier) : identifier.trim(), password, method },
    { onSuccess: (result) => result.mfaRequired && result.mfaChallengeToken
      ? setMfaChallenge(result.mfaChallengeToken)
      : onSession(result) },
  )
  const verifyVersionAndLogin = async () => {
    setCheckingVersion(true)
    const requiredUpdate = await checkAppVersionBeforeLogin()
    setCheckingVersion(false)
    if (requiredUpdate) {
      setVersionCheck(requiredUpdate)
      return
    }
    submitLogin()
  }
  if (mfaChallenge) {
    return <KeyboardAwareScreen>
      <Image source={require('../../../../assets/logo-horizontal-dark.png')} style={authStyles.logo} resizeMode="contain" />
      <Text style={styles.title}>Verificación administrativa</Text>
      <Text style={styles.subtitle}>Enviamos un código de seis dígitos al correo de la cuenta.</Text>
      <Field style={authStyles.baseInput} keyboardType="number-pad" maxLength={6}
        placeholder="Código MFA" value={mfaCode}
        onChangeText={(value) => setMfaCode(value.replace(/\D/g, ''))} />
      {verifyMfa.error && <Text style={styles.error}>{apiMessage(verifyMfa.error)}</Text>}
      <Button title="Verificar e ingresar"
        onPress={() => verifyMfa.mutate({ challengeToken: mfaChallenge, code: mfaCode })}
        loading={verifyMfa.isPending} disabled={mfaCode.length !== 6} />
      <Pressable onPress={() => { setMfaChallenge(''); setMfaCode('') }}>
        <Text style={styles.link}>Volver al inicio de sesión</Text>
      </Pressable>
    </KeyboardAwareScreen>
  }
  return <KeyboardAwareScreen><Image source={require('../../../../assets/logo-horizontal-dark.png')} style={authStyles.logo} resizeMode="contain" /><Text style={styles.title}>Bienvenido de nuevo</Text><Text style={styles.subtitle}>Ayuda técnica cerca de ti.</Text>
    <View style={authStyles.roleRow}>
      <Pressable style={[authStyles.roleButton, method === 'email' && authStyles.roleButtonActive]} onPress={() => { setMethod('email'); setIdentifier('') }}><Text style={[authStyles.roleText, method === 'email' && authStyles.roleTextActive]}>Correo</Text></Pressable>
      <Pressable style={[authStyles.roleButton, method === 'phone' && authStyles.roleButtonActive]} onPress={() => { setMethod('phone'); setIdentifier('') }}><Text style={[authStyles.roleText, method === 'phone' && authStyles.roleTextActive]}>Celular</Text></Pressable>
    </View>
    <Field testID="e2e.login.identifier" style={authStyles.baseInput} autoCapitalize="none" keyboardType={method === 'email' ? 'email-address' : 'number-pad'} maxLength={method === 'phone' ? 10 : undefined} placeholder={method === 'email' ? 'Correo' : 'Celular, ej. 3001234567'} value={identifier} onChangeText={(value) => setIdentifier(method === 'phone' ? normalizeLocalPhone(value) : value)} />
    {method === 'phone' && identifier.length > 0 && !isValidLocalPhone(identifier) && <Text style={styles.error}>{localPhoneHint}</Text>}
    <SecureField testID="e2e.login.password" style={authStyles.baseInput}  placeholder="Contraseña" value={password} onChangeText={setPassword} />
    {login.error && <Text style={styles.error}>{apiMessage(login.error)}</Text>}<Button testID="e2e.login.submit" title="Ingresar"
      onPress={() => void verifyVersionAndLogin()}
      loading={login.isPending || checkingVersion} disabled={!canLogin || checkingVersion} />
    <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.link}>¿Olvidaste tu contraseña?</Text></Pressable>
    <Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Crear una cuenta</Text></Pressable>
    <AppVersionModal check={versionCheck} onContinue={() => {
      setVersionCheck(undefined)
      submitLogin()
    }} continueLabel="Continuar e ingresar" />
  </KeyboardAwareScreen>
}

export function RegisterScreen({ navigation, onSession }: Props) {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [form, setForm] = useState({ fullName: '', email: '', confirmEmail: '', phone: '', password: '', confirmPassword: '' })
  const [otpCode, setOtpCode] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [otpNotice, setOtpNotice] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'TECHNICIAN'>('CLIENT')
  const [referralCode, setReferralCode] = useState('')
  const [referralMessage, setReferralMessage] = useState('')
  const register = useRegister(onSession)
  const registerByPhone = useRegisterByPhone(onSession)
  const sendOtp = useSendPhoneOtp()
  const verifyOtp = useVerifyPhoneOtp()
  const emailsMatch = form.email.trim().toLowerCase() === form.confirmEmail.trim().toLowerCase()
  return <KeyboardAwareScreen contentContainerStyle={authStyles.registerContent} keyboardVerticalOffset={20}><Image source={require('../../../../assets/logo-horizontal-dark.png')} style={authStyles.logo} resizeMode="contain" /><Text style={styles.title}>Crea tu cuenta</Text><Text style={styles.subtitle}>Solicita tu primer servicio en minutos.</Text>
    <Text style={styles.label}>Tipo de cuenta</Text>
    <View style={authStyles.roleRow}>
      <Pressable style={[authStyles.roleButton, role === 'CLIENT' && authStyles.roleButtonActive]} onPress={() => setRole('CLIENT')}><Text style={[authStyles.roleText, role === 'CLIENT' && authStyles.roleTextActive]}>Cliente {role === 'CLIENT' ? '✓' : ''}</Text></Pressable>
      <Pressable style={[authStyles.roleButton, role === 'TECHNICIAN' && authStyles.roleButtonActive]} onPress={() => setRole('TECHNICIAN')}><Text style={[authStyles.roleText, role === 'TECHNICIAN' && authStyles.roleTextActive]}>Trabaja con nosotros {role === 'TECHNICIAN' ? '✓' : ''}</Text></Pressable>
    </View>
    <Text style={styles.label}>Forma de registro</Text>
    <View style={authStyles.roleRow}>
      <Pressable style={[authStyles.roleButton, method === 'email' && authStyles.roleButtonActive]} onPress={() => setMethod('email')}><Text style={[authStyles.roleText, method === 'email' && authStyles.roleTextActive]}>Correo</Text></Pressable>
      <Pressable style={[authStyles.roleButton, method === 'phone' && authStyles.roleButtonActive]} onPress={() => setMethod('phone')}><Text style={[authStyles.roleText, method === 'phone' && authStyles.roleTextActive]}>Celular</Text></Pressable>
    </View>
    <Field style={authStyles.baseInput} placeholder="Nombre completo" value={form.fullName} onChangeText={(fullName) => setForm({ ...form, fullName })} />
    {method === 'email'
      ? <>
        <Field style={authStyles.baseInput} autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
        <Field style={authStyles.baseInput} autoCapitalize="none" keyboardType="email-address" placeholder="Confirmar correo" value={form.confirmEmail} onChangeText={(confirmEmail) => setForm({ ...form, confirmEmail })} />
        {form.confirmEmail && !emailsMatch && <Text style={styles.error}>Los correos no coinciden</Text>}
      </>
      : <><Field style={authStyles.baseInput} keyboardType="number-pad" maxLength={10} placeholder="Celular, ej. 3001234567" value={form.phone} onChangeText={(phone) => { setForm({ ...form, phone: normalizeLocalPhone(phone) }); setVerificationToken('') }} />
        {form.phone.length > 0 && !isValidLocalPhone(form.phone) && <Text style={styles.error}>{localPhoneHint}</Text>}
        <Button title="Enviar código" onPress={() => sendOtp.mutate(form.phone, { onSuccess: (data) => setOtpNotice(data.debugCode ? `Código de desarrollo: ${data.debugCode}` : 'Código enviado por SMS.') })} loading={sendOtp.isPending} disabled={!isValidLocalPhone(form.phone)} />
        <Field style={authStyles.baseInput} keyboardType="number-pad" maxLength={8} placeholder="Código OTP" value={otpCode} onChangeText={(value) => setOtpCode(value.replace(/\D/g, ''))} />
        <Button title={verificationToken ? 'Celular verificado' : 'Verificar código'} onPress={() => verifyOtp.mutate({ phone: form.phone, code: otpCode }, { onSuccess: (data) => { setVerificationToken(data.verificationToken); setOtpNotice('Celular verificado correctamente.') } })} loading={verifyOtp.isPending} disabled={!otpCode || !isValidLocalPhone(form.phone) || Boolean(verificationToken)} />
        {otpNotice && <Text style={styles.muted}>{otpNotice}</Text>}
        {(sendOtp.error || verifyOtp.error) && <Text style={styles.error}>{apiMessage(sendOtp.error ?? verifyOtp.error)}</Text>}</>}
    <SecureField style={authStyles.baseInput} placeholder="Contraseña" value={form.password} onChangeText={(password) => setForm({ ...form, password })} />
    <SecureField style={authStyles.baseInput} placeholder="Confirmar contraseña" value={form.confirmPassword} onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })} />
    <Field style={authStyles.baseInput} autoCapitalize="characters" placeholder="Código de referido (opcional)" value={referralCode} onChangeText={(value) => { setReferralCode(value.toUpperCase()); setReferralMessage('') }} onBlur={() => {
      if (referralCode.trim()) void authApi.validateReferral(referralCode.trim()).then((value) => setReferralMessage(value.message)).catch(() => setReferralMessage('No fue posible validar el código.'))
    }} />
    {referralMessage && <Text style={styles.muted}>{referralMessage}</Text>}
    <Text style={styles.muted}>Al ingresar podrás completar el perfil y subir el documento para verificación.</Text>
    {form.confirmPassword && form.password !== form.confirmPassword && <Text style={styles.error}>Las contraseñas no coinciden</Text>}
    {(register.error || registerByPhone.error) && <Text style={styles.error}>{apiMessage(register.error ?? registerByPhone.error)}</Text>}<Button title="Registrarme" onPress={() => {
      if (form.password !== form.confirmPassword) return
      if (method === 'email') {
        if (!emailsMatch) return
        register.mutate({ fullName: form.fullName, email: form.email, confirmEmail: form.confirmEmail, password: form.password, confirmPassword: form.confirmPassword, role, referralCode: referralCode.trim() || undefined })
      }
      else if (verificationToken) registerByPhone.mutate({ fullName: form.fullName, phone: normalizeLocalPhone(form.phone), verificationToken, password: form.password, confirmPassword: form.confirmPassword, role, referralCode: referralCode.trim() || undefined })
    }} loading={register.isPending || registerByPhone.isPending} disabled={(method === 'email' && !emailsMatch) || (method === 'phone' && (!verificationToken || !isValidLocalPhone(form.phone)))} />
    <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Ya tengo cuenta</Text></Pressable>
  </KeyboardAwareScreen>
}

const authStyles = StyleSheet.create({
  registerContent: { paddingBottom: 220 },
  logo: { alignSelf: 'center', width: 230, height: 82, marginBottom: 18 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  roleButton: { flex: 1, borderColor: colors.border, borderRadius: 14, borderWidth: 1, paddingVertical: 12, backgroundColor: colors.card },
  roleButtonActive: { borderColor: colors.brand, backgroundColor: colors.dark },
  roleText: { color: colors.muted, fontWeight: '800', textAlign: 'center' },
  roleTextActive: { color: colors.brand },
  baseInput: { marginVertical: 8, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 14 },

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
