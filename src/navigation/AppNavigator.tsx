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
import { openNotification } from './notificationNavigation'
import type { LinkingOptions } from '@react-navigation/native'
import type { RootStackParamList } from '../types'
import { setOperationBlockedHandler } from '../api/client'
import { useQueryClient } from '@tanstack/react-query'
import { syncNotificationData } from '../features/notifications/sync'

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.brand, background: colors.bg, card: colors.card, border: colors.border },
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['tecngo://', 'https://tecn-go.com', 'https://www.tecn-go.com'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
}

export function AppNavigator() {
  const { session, ready } = useSession()
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!session) return
    setOperationBlockedHandler((code) => {
      if (!navigationRef.isReady()) return
      const current = navigationRef.getCurrentRoute()?.name
      if (code === 'EMAIL_NOT_VERIFIED' && current !== 'EmailConfirmationRequired') {
        navigationRef.navigate('EmailConfirmationRequired')
      }
      if ((code === 'ONBOARDING_REQUIRED' || code === 'TECHNICIAN_PROFILE_INCOMPLETE')
          && current !== 'OnboardingRequired') {
        navigationRef.navigate('OnboardingRequired')
      }
    })
    const sync = (data: Record<string, unknown>) => {
      void syncNotificationData(queryClient, {
        notificationType: typeof data.notificationType === 'string' ? data.notificationType : undefined,
        type: typeof data.type === 'string' ? data.type : undefined,
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
      })
    }
    return addNotificationListeners(sync, (data) => {
      sync(data)
      if (!navigationRef.isReady()) return
      openNotification(navigationRef, session.role, {
        route: typeof data.route === 'string' ? data.route : undefined,
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        type: typeof data.notificationType === 'string'
          ? data.notificationType as import('../types').UserNotification['type']
          : 'SERVICE_STATUS_CHANGED',
      })
    })
  }, [queryClient, session])

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.brand} /></View>
  return <NavigationContainer ref={navigationRef} theme={theme} linking={linking}>
    {!session ? <AuthNavigator />
      : session.role === 'CLIENT' ? <ClientNavigator />
        : session.role === 'TECHNICIAN' ? <TechnicianNavigator />
          : <StaffNavigator />}
  </NavigationContainer>
}
