import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import { ActivityIndicator, View } from 'react-native'
import { useEffect } from 'react'
import { colors } from '../components/UI'
import { useSession } from '../context/useSession'
import { addNotificationListeners } from '../services/notifications'
import { AuthNavigator } from './AuthNavigator'
import { ClientNavigator } from './ClientNavigator'
import { navigationRef } from './navigationRef'
import { StaffNavigator } from './StaffNavigator'
import { TechnicianNavigator } from './TechnicianNavigator'

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.brand, background: colors.bg, card: colors.card, border: colors.border },
}

export function AppNavigator() {
  const { session, ready } = useSession()
  useEffect(() => {
    if (!session) return
    return addNotificationListeners((data) => {
      if (!navigationRef.isReady()) return
      const route = typeof data.route === 'string' ? data.route : ''
      const requestId = typeof data.requestId === 'string' ? data.requestId : ''
      if (route === 'Chat' && requestId) navigationRef.navigate('Chat', { requestId })
      else if (route === 'AvailableRequests' && session.role === 'TECHNICIAN') navigationRef.navigate('AvailableRequests')
      else if (session.role === 'CLIENT' || session.role === 'TECHNICIAN') navigationRef.navigate('Notifications')
    })
  }, [session])

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.brand} /></View>
  return <NavigationContainer ref={navigationRef} theme={theme}>
    {!session ? <AuthNavigator />
      : session.role === 'CLIENT' ? <ClientNavigator />
        : session.role === 'TECHNICIAN' ? <TechnicianNavigator />
          : <StaffNavigator />}
  </NavigationContainer>
}
