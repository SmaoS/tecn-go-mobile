import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoginScreen, RegisterScreen } from '../features/auth/screens/AuthScreens'
import type { RootStackParamList } from '../types'
import { useSession } from '../context/useSession'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AuthNavigator() {
  const { setSession } = useSession()
  return <Stack.Navigator>
    <Stack.Screen name="Login" options={{ headerShown: false }}>{(props) => <LoginScreen {...props} onSession={setSession} />}</Stack.Screen>
    <Stack.Screen name="Register" options={{ title: 'Registro' }}>{(props) => <RegisterScreen {...props} onSession={setSession} />}</Stack.Screen>
  </Stack.Navigator>
}
