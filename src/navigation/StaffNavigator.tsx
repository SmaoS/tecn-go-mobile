import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function StaffNavigator() {
  const { session, logout } = useSession()
  return <Stack.Navigator>
    <Stack.Screen name="Profile" options={{ title: session?.role === 'VERIFIER' ? 'Verificador' : 'Administrador' }}>
      {() => <ProfileScreen session={session!} onLogout={logout} />}
    </Stack.Screen>
  </Stack.Navigator>
}
