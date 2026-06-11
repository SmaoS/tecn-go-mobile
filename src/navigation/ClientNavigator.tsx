import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChatScreen } from '../features/chat/screens/ChatScreen'
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import { RatingScreen } from '../features/ratings/screens/RatingScreen'
import { ClientHomeScreen } from '../features/service-requests/screens/ClientHomeScreen'
import { CreateRequestScreen } from '../features/service-requests/screens/CreateRequestScreen'
import { NearbyTechniciansScreen } from '../features/service-requests/screens/NearbyTechniciansScreen'
import { RequestDetailScreen } from '../features/service-requests/screens/RequestDetailScreen'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function ClientNavigator() {
  const { session, logout } = useSession()
  return <Stack.Navigator>
    <Stack.Screen name="Home" component={ClientHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RequestService" component={CreateRequestScreen} options={{ title: 'Solicitar servicio' }} />
    <Stack.Screen name="NearbyTechnicians" component={NearbyTechniciansScreen} options={{ title: 'Cerca de ti' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Solicitud' }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Calificación' }} />
    <Stack.Screen name="Profile" options={{ title: 'Perfil' }}>{() => <ProfileScreen session={session!} onLogout={logout} />}</Stack.Screen>
  </Stack.Navigator>
}
