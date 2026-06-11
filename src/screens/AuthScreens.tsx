import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, SESSION_KEY } from '../api/client'
import { Button, Field, Screen, styles } from '../components/UI'
import type { RootStackParamList, Session } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Login' | 'Register'> & {
  onSession: (session: Session) => void
}

const errorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return 'Error inesperado'
  if (error.response) return error.response.data?.message ?? `La API respondió con estado ${error.response.status}`
  return `No fue posible conectar con TecnGo en ${api.defaults.baseURL}`
}

export function LoginScreen({ navigation, onSession }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function login() {
    setLoading(true); setError('')
    try {
      const { data } = await api.post<Session>('/v1/auth/login', { email, password })
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data)); onSession(data)
    } catch (reason) { setError(errorMessage(reason)) } finally { setLoading(false) }
  }
  return <Screen><Text style={styles.title}>TecnGo</Text><Text style={styles.subtitle}>Ayuda técnica cerca de ti.</Text>
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={email} onChangeText={setEmail} />
    <Field secureTextEntry placeholder="Contraseña" value={password} onChangeText={setPassword} />
    {!!error && <Text style={styles.error}>{error}</Text>}<Button title="Ingresar" onPress={login} loading={loading} />
    <Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Crear una cuenta</Text></Pressable>
  </Screen>
}

export function RegisterScreen({ navigation, onSession }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [role, setRole] = useState<'CLIENT' | 'TECHNICIAN'>('CLIENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function register() {
    setLoading(true); setError('')
    try {
      const { data } = await api.post<Session>('/v1/auth/register', { ...form, role })
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data)); onSession(data)
    } catch (reason) { setError(errorMessage(reason)) } finally { setLoading(false) }
  }
  return <Screen><Text style={styles.title}>Crea tu cuenta</Text><Text style={styles.subtitle}>Solicita tu primer servicio en minutos.</Text>
    <Text style={styles.label}>Tipo de cuenta</Text>
    <Pressable onPress={() => setRole('CLIENT')}><Text style={[styles.link, role === 'CLIENT' && { fontWeight: '800' }]}>Cliente {role === 'CLIENT' ? '✓' : ''}</Text></Pressable>
    <Pressable onPress={() => setRole('TECHNICIAN')}><Text style={[styles.link, role === 'TECHNICIAN' && { fontWeight: '800' }]}>Técnico {role === 'TECHNICIAN' ? '✓' : ''}</Text></Pressable>
    <Field placeholder="Nombre completo" value={form.fullName} onChangeText={(fullName) => setForm({ ...form, fullName })} />
    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Correo" value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
    <Field secureTextEntry placeholder="Contraseña" value={form.password} onChangeText={(password) => setForm({ ...form, password })} />
    <Text style={styles.muted}>Al ingresar podrás completar el perfil y subir el documento para verificación.</Text>
    {!!error && <Text style={styles.error}>{error}</Text>}<Button title="Registrarme" onPress={register} loading={loading} />
    <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Ya tengo cuenta</Text></Pressable>
  </Screen>
}
