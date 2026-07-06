import { useEffect } from 'react'
import { AppState } from 'react-native'
import { addPushTokenListener, preparePushNotifications } from '../../services/notifications'
import { pushRegistrationApi } from './registration'

let lastRegistration: string | null = null

export function resetPushRegistrationCache() {
  lastRegistration = null
}

export function usePushRegistration(userId?: string) {
  useEffect(() => {
    if (!userId) return
    const saveToken = async (token: string) => {
      const registration = `${userId}:${token}`
      if (registration === lastRegistration) return
      await pushRegistrationApi.register(token)
      lastRegistration = registration
    }
    const register = () => {
      void preparePushNotifications()
        .then((token) => token ? saveToken(token) : undefined)
        .catch(() => undefined)
    }
    register()
    const removeTokenListener = addPushTokenListener((token) => {
      void saveToken(token).catch(() => undefined)
    })
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') register()
    })
    return () => {
      removeTokenListener()
      appState.remove()
    }
  }, [userId])
}
