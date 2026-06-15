import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChatScreen } from '../features/chat/screens/ChatScreen'
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import { RatingScreen } from '../features/ratings/screens/RatingScreen'
import { AvailableRequestsScreen } from '../features/technician/screens/AvailableRequestsScreen'
import { TechnicianHomeScreen } from '../features/technician/screens/TechnicianHomeScreen'
import { TechnicianEntryScreen } from '../features/technician/screens/TechnicianEntryScreen'
import { TechnicianProfileScreen } from '../features/technician/screens/TechnicianProfileScreen'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'
import { ServiceSupportScreen } from '../features/service-support/screens/ServiceSupportScreen'
import { LegalScreen } from '../features/legal/screens/LegalScreen'
import { CaptureProfilePhotoScreen } from '../features/profile/screens/CaptureProfilePhotoScreen'
import { TechnicianReferralsScreen } from '../features/technician/screens/TechnicianReferralsScreen'
import { NotificationRequestScreen } from '../features/service-requests/screens/NotificationRequestScreen'
import { TechnicianRequestHistoryScreen } from '../features/service-requests/screens/RequestHistoryScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function TechnicianNavigator() {
  const { session, logout } = useSession()
  return <Stack.Navigator initialRouteName="TechnicianEntry">
    <Stack.Screen name="TechnicianEntry" component={TechnicianEntryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TechnicianHome" component={TechnicianHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: 'Perfil técnico' }} />
    <Stack.Screen name="AvailableRequests" component={AvailableRequestsScreen} options={{ title: 'Disponibles' }} />
    <Stack.Screen name="TechnicianHistory" component={TechnicianRequestHistoryScreen} options={{ title: 'Historial' }} />
    <Stack.Screen name="NotificationRequest" component={NotificationRequestScreen} options={{ title: 'Solicitud' }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Calificación del cliente' }} />
    <Stack.Screen name="Profile" options={{ title: 'Perfil' }}>{({ navigation }) => <ProfileScreen session={session!} onLogout={logout} navigation={navigation} />}</Stack.Screen>
    <Stack.Screen name="ServiceSupport" component={ServiceSupportScreen} options={{ title: 'Evidencias y soporte' }} />
    <Stack.Screen name="Legal" component={LegalScreen} options={{ title: 'Compromiso y términos' }} />
    <Stack.Screen name="CaptureProfilePhoto" component={CaptureProfilePhotoScreen} options={{ title: 'Foto de perfil' }} />
    <Stack.Screen name="TechnicianReferrals" component={TechnicianReferralsScreen} options={{ title: 'Invita y gana' }} />
  </Stack.Navigator>
}
