import type { NavigationContainerRefWithCurrent } from '@react-navigation/native'
import type { Role, RootStackParamList, UserNotification } from '../types'

export function openNotification(
  navigation: NavigationContainerRefWithCurrent<RootStackParamList>,
  role: Role,
  notification: Pick<UserNotification, 'route' | 'requestId' | 'type'>,
) {
  if (!navigation.isReady()) return
  const route = notification.route ?? ''
  if (route === 'Legal' || notification.type === 'LEGAL_ACCEPTANCE_REQUIRED') {
    navigation.navigate('Legal')
  } else if ((route === 'AvailableRequests' || notification.type === 'NEW_REQUEST') && role === 'TECHNICIAN') {
    navigation.navigate('AvailableRequests')
  } else if (route === 'Chat' && notification.requestId) {
    navigation.navigate('Chat', { requestId: notification.requestId })
  } else if (route === 'ServiceSupport' && notification.requestId) {
    navigation.navigate('ServiceSupport', { requestId: notification.requestId })
  } else if (notification.requestId) {
    navigation.navigate('NotificationRequest', { requestId: notification.requestId })
  } else if (role === 'CLIENT') {
    navigation.navigate('Home')
  } else if (role === 'TECHNICIAN') {
    navigation.navigate('TechnicianHome')
  }
}
