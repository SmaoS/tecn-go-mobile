import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer, DarkTheme, createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import * as Location from 'expo-location'
import { SESSION_KEY, setUnauthorizedHandler } from './src/api/client'
import { colors } from './src/components/UI'
import { LoginScreen, RegisterScreen } from './src/screens/AuthScreens'
import { ChatScreen, HomeScreen, NearbyTechniciansScreen, NotificationsScreen, ProfileScreen, RatingScreen, RequestDetailScreen, RequestServiceScreen } from './src/screens/MainScreens'
import { AvailableRequestsScreen, TechnicianHomeScreen, TechnicianProfileScreen } from './src/screens/TechnicianScreens'
import { api } from './src/api/client'
import { addNotificationListeners, preparePushNotifications } from './src/services/notifications'
import type { RootStackParamList, Session } from './src/types'

const Stack = createNativeStackNavigator<RootStackParamList>()
const navigationRef = createNavigationContainerRef<RootStackParamList>()
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: colors.brand, background: colors.bg, card: colors.card, border: colors.border } }

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => { AsyncStorage.getItem(SESSION_KEY).then((raw) => { if (raw) setSession(JSON.parse(raw)); setReady(true) }) }, [])
  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null))
  }, [])
  useEffect(() => {
    if (!session) return
    preparePushNotifications().then((token) => {
      if (token) return api.put('/v1/users/me/fcm-token', { token })
    }).catch(() => undefined)
  }, [session])
  useEffect(() => {
    if (!session) return
    return addNotificationListeners((data) => {
      if (!navigationRef.isReady()) return
      const route = typeof data.route === 'string' ? data.route : ''
      const requestId = typeof data.requestId === 'string' ? data.requestId : ''
      if (route === 'Chat' && requestId) {
        navigationRef.navigate('Chat', { requestId })
      } else if (route === 'AvailableRequests' && session.role === 'TECHNICIAN') {
        navigationRef.navigate('AvailableRequests')
      } else if (session.role === 'CLIENT' || session.role === 'TECHNICIAN') {
        navigationRef.navigate('Notifications')
      }
    })
  }, [session])
  async function logout() {
    if (session?.role === 'TECHNICIAN') {
      try {
        const location = await Location.getLastKnownPositionAsync()
        if (location) await api.put('/v1/technicians/me/location', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          online: false,
        })
      } catch {
        // Logout must continue even when location cannot be updated.
      }
    }
    await AsyncStorage.removeItem(SESSION_KEY)
    setSession(null)
  }
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.brand} /></View>
  return <NavigationContainer ref={navigationRef} theme={theme}><StatusBar style="light" /><Stack.Navigator>
    {!session ? <>
      <Stack.Screen name="Login" options={{ headerShown: false }}>{(props) => <LoginScreen {...props} onSession={setSession} />}</Stack.Screen>
      <Stack.Screen name="Register" options={{ title: 'Registro' }}>{(props) => <RegisterScreen {...props} onSession={setSession} />}</Stack.Screen>
    </> : session.role === 'TECHNICIAN' ? <>
      <Stack.Screen name="TechnicianHome" component={TechnicianHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: 'Perfil técnico' }} />
      <Stack.Screen name="AvailableRequests" component={AvailableRequestsScreen} options={{ title: 'Disponibles' }} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Calificación del cliente' }} />
      <Stack.Screen name="Profile" options={{ title: 'Perfil' }}>{() => <ProfileScreen session={session} onLogout={logout} />}</Stack.Screen>
    </> : session.role === 'CLIENT' ? <>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RequestService" component={RequestServiceScreen} options={{ title: 'Solicitar servicio' }} />
      <Stack.Screen name="NearbyTechnicians" component={NearbyTechniciansScreen} options={{ title: 'Cerca de ti' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Solicitud' }} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Calificación' }} />
      <Stack.Screen name="Profile" options={{ title: 'Perfil' }}>{() => <ProfileScreen session={session} onLogout={logout} />}</Stack.Screen>
    </> : <>
      <Stack.Screen name="Profile" options={{ title: 'Administrador' }}>{() => <ProfileScreen session={session} onLogout={logout} />}</Stack.Screen>
    </>}
  </Stack.Navigator></NavigationContainer>
}
