import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function preparePushNotifications() {
  if (!Device.isDevice) return null
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TecnGo',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    })
  }
  const existing = await Notifications.getPermissionsAsync()
  const permission = existing.status === 'granted'
    ? existing
    : await Notifications.requestPermissionsAsync()
  if (permission.status !== 'granted') return null
  const token = await Notifications.getDevicePushTokenAsync()
  return typeof token.data === 'string' ? token.data : JSON.stringify(token.data)
}

export function addNotificationListeners(onResponse: (data: Record<string, unknown>) => void) {
  const received = Notifications.addNotificationReceivedListener(() => undefined)
  const response = Notifications.addNotificationResponseReceivedListener((event) => {
    onResponse(event.notification.request.content.data)
  })
  void Notifications.getLastNotificationResponseAsync().then((event) => {
    if (event) onResponse(event.notification.request.content.data)
  })
  return () => {
    received.remove()
    response.remove()
  }
}
