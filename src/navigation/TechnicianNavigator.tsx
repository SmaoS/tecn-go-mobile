import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChatScreen } from '../features/chat/screens/ChatScreen'
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import { RatingScreen } from '../features/ratings/screens/RatingScreen'
import { AvailableRequestsScreen } from '../features/technician/screens/AvailableRequestsScreen'
import { TechnicianHomeScreen } from '../features/technician/screens/TechnicianHomeScreen'
import { TechnicianProfileScreen } from '../features/technician/screens/TechnicianProfileScreen'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function TechnicianNavigator() {
  const { session, logout } = useSession()
  return <Stack.Navigator>
    <Stack.Screen name="TechnicianHome" component={TechnicianHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: 'Perfil técnico' }} />
    <Stack.Screen name="AvailableRequests" component={AvailableRequestsScreen} options={{ title: 'Disponibles' }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Calificación del cliente' }} />
    <Stack.Screen name="Profile" options={{ title: 'Perfil' }}>{() => <ProfileScreen session={session!} onLogout={logout} />}</Stack.Screen>
  </Stack.Navigator>
}
