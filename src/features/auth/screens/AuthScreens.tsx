import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Field, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { RootStackParamList, Session } from '../../../types'
import { useLogin, useRegister } from '../hooks'

type Props = NativeStackScreenProps<RootStackParamList, 'Login' | 'Register'> & {
  onSession: (session: Session) => void
}

export function LoginScreen({ navigation, onSession }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin(onSession)
  return <KeyboardAwareScreen><Text style={styles.title}>TecnGo</Text><Text style={styles.subtitle}>Ayuda técnica cerca de ti.</Text>
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={email} onChangeText={setEmail} />
    <Field secureTextEntry placeholder="Contraseña" value={password} onChangeText={setPassword} />
    {login.error && <Text style={styles.error}>{apiMessage(login.error)}</Text>}<Button title="Ingresar" onPress={() => login.mutate({ email, password })} loading={login.isPending} />
    <Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Crear una cuenta</Text></Pressable>
  </KeyboardAwareScreen>
}

export function RegisterScreen({ navigation, onSession }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [role, setRole] = useState<'CLIENT' | 'TECHNICIAN'>('CLIENT')
  const register = useRegister(onSession)
  return <KeyboardAwareScreen><Text style={styles.title}>Crea tu cuenta</Text><Text style={styles.subtitle}>Solicita tu primer servicio en minutos.</Text>
    <Text style={styles.label}>Tipo de cuenta</Text>
    <Pressable onPress={() => setRole('CLIENT')}><Text style={[styles.link, role === 'CLIENT' && { fontWeight: '800' }]}>Cliente {role === 'CLIENT' ? '✓' : ''}</Text></Pressable>
    <Pressable onPress={() => setRole('TECHNICIAN')}><Text style={[styles.link, role === 'TECHNICIAN' && { fontWeight: '800' }]}>Técnico {role === 'TECHNICIAN' ? '✓' : ''}</Text></Pressable>
    <Field placeholder="Nombre completo" value={form.fullName} onChangeText={(fullName) => setForm({ ...form, fullName })} />
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
    <Field secureTextEntry placeholder="Contraseña" value={form.password} onChangeText={(password) => setForm({ ...form, password })} />
    <Text style={styles.muted}>Al ingresar podrás completar el perfil y subir el documento para verificación.</Text>
    {register.error && <Text style={styles.error}>{apiMessage(register.error)}</Text>}<Button title="Registrarme" onPress={() => register.mutate({ ...form, role })} loading={register.isPending} />
    <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Ya tengo cuenta</Text></Pressable>
  </KeyboardAwareScreen>
}
