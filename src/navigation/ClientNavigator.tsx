import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChatScreen } from '../features/chat/screens/ChatScreen'
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import { RatingScreen } from '../features/ratings/screens/RatingScreen'
import { ClientHomeScreen } from '../features/service-requests/screens/ClientHomeScreen'
import { CreateRequestScreen } from '../features/service-requests/screens/CreateRequestScreen'
import { NearbyTechniciansScreen } from '../features/service-requests/screens/NearbyTechniciansScreen'
import { RequestDetailScreen } from '../features/service-requests/screens/RequestDetailScreen'
import { NotificationRequestScreen } from '../features/service-requests/screens/NotificationRequestScreen'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'
import { ServiceSupportScreen } from '../features/service-support/screens/ServiceSupportScreen'
import { LegalScreen } from '../features/legal/screens/LegalScreen'
import { CaptureProfilePhotoScreen } from '../features/profile/screens/CaptureProfilePhotoScreen'
import { ClientRequestHistoryScreen } from '../features/service-requests/screens/RequestHistoryScreen'
import { EmailConfirmationRequiredScreen } from '../features/onboarding/screens/EmailConfirmationRequiredScreen'
import { OnboardingRequiredScreen } from '../features/onboarding/screens/OnboardingRequiredScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function ClientNavigator() {
  const { session, logout } = useSession()
  return <Stack.Navigator>
    <Stack.Screen name="Home" component={ClientHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EmailConfirmationRequired" component={EmailConfirmationRequiredScreen} options={{ title: 'Confirma tu correo' }} />
    <Stack.Screen name="OnboardingRequired" component={OnboardingRequiredScreen} options={{ title: 'Inscripción' }} />
    <Stack.Screen name="RequestService" component={CreateRequestScreen} options={{ title: 'Solicitar servicio' }} />
    <Stack.Screen name="NearbyTechnicians" component={NearbyTechniciansScreen} options={{ title: 'Cerca de ti' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Solicitud' }} />
    <Stack.Screen name="RequestHistory" component={ClientRequestHistoryScreen} options={{ title: 'Historial' }} />
    <Stack.Screen name="NotificationRequest" component={NotificationRequestScreen} options={{ title: 'Solicitud' }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <Stack.Screen name="Rating" component={RatingScreen} options={{ title: 'Calificación' }} />
    <Stack.Screen name="Profile" options={{ title: 'Perfil' }}>{({ navigation }) => <ProfileScreen session={session!} onLogout={logout} navigation={navigation} />}</Stack.Screen>
    <Stack.Screen name="ServiceSupport" component={ServiceSupportScreen} options={{ title: 'Evidencias y soporte' }} />
    <Stack.Screen name="Legal" component={LegalScreen} options={{ title: 'Seguridad y términos' }} />
    <Stack.Screen name="CaptureProfilePhoto" component={CaptureProfilePhotoScreen} options={{ title: 'Foto de perfil' }} />
  </Stack.Navigator>
}
