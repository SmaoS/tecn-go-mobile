import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChatScreen } from '../features/chat/screens/ChatScreen'
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen'
import { ClientPaymentsScreen } from '../features/payments/screens/ClientPaymentsScreen'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import { RatingScreen } from '../features/ratings/screens/RatingScreen'
import { ClientActiveRequestsScreen } from '../features/service-requests/screens/ClientActiveRequestsScreen'
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
import { CaptureSelfieScreen } from '../features/onboarding/screens/CaptureSelfieScreen'
import { CaptureIdentityDocumentScreen } from '../features/onboarding/screens/CaptureIdentityDocumentScreen'
import { TechnicianReferralsScreen } from '../features/technician/screens/TechnicianReferralsScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function ClientNavigator() {
  const { session, logout } = useSession()
  const initialRoute = !session?.emailVerified && !session?.phoneVerified
    ? 'EmailConfirmationRequired'
    : !session.onboardingCompleted
      ? 'OnboardingRequired'
      : 'Home'
  return <Stack.Navigator initialRouteName={initialRoute}>
    <Stack.Screen name="Home" component={ClientHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ClientRequests" component={ClientActiveRequestsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ClientPayments" component={ClientPaymentsScreen} options={{ title: 'Pagos' }} />
    <Stack.Screen name="EmailConfirmationRequired" component={EmailConfirmationRequiredScreen} options={{ title: 'Confirma tu correo' }} />
    <Stack.Screen name="OnboardingRequired" component={OnboardingRequiredScreen} options={{ title: 'Inscripción' }} />
    <Stack.Screen name="CaptureSelfie" component={CaptureSelfieScreen} options={{ title: 'Selfie de perfil' }} />
    <Stack.Screen name="CaptureIdentityDocument" component={CaptureIdentityDocumentScreen} options={{ title: 'Documento' }} />
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
    <Stack.Screen name="TechnicianReferrals" component={TechnicianReferralsScreen} options={{ title: 'Invita amigos' }} />
  </Stack.Navigator>
}
