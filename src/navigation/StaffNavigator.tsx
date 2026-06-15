import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'
import { Pressable, Text } from 'react-native'
import { colors } from '../components/UI'
import { ChatModerationScreen } from '../features/chat/screens/ChatModerationScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function StaffNavigator() {
  const { session, logout } = useSession()
  return <Stack.Navigator>
    <Stack.Screen name="Profile" options={({ navigation }) => ({
      title: session?.role === 'VERIFIER' ? 'Verificador' : 'Administrador',
      headerRight: () => <Pressable onPress={() => navigation.navigate('ChatModeration')}>
        <Text style={{ color: colors.brand, fontWeight: '700' }}>Moderar chat</Text>
      </Pressable>,
    })}>
      {() => <ProfileScreen session={session!} onLogout={logout} rootExit />}
    </Stack.Screen>
    <Stack.Screen name="ChatModeration" component={ChatModerationScreen} options={{ title: 'Moderación de chat' }} />
  </Stack.Navigator>
}
