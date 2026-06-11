import { useEffect } from 'react'
import { preparePushNotifications } from '../../services/notifications'
import { pushRegistrationApi } from './registration'

export function usePushRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    preparePushNotifications()
      .then((token) => token ? pushRegistrationApi.register(token) : undefined)
      .catch(() => undefined)
  }, [enabled])
}
