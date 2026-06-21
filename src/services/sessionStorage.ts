import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

export const SESSION_KEY = 'tecngo.session'

async function secureStoreAvailable() {
  return Platform.OS !== 'web' && await SecureStore.isAvailableAsync()
}

export async function getStoredSession() {
  if (!await secureStoreAvailable()) return AsyncStorage.getItem(SESSION_KEY)
  const secured = await SecureStore.getItemAsync(SESSION_KEY)
  if (secured) return secured

  const legacy = await AsyncStorage.getItem(SESSION_KEY)
  if (legacy) {
    await SecureStore.setItemAsync(SESSION_KEY, legacy, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    })
    await AsyncStorage.removeItem(SESSION_KEY)
  }
  return legacy
}

export async function setStoredSession(value: string) {
  if (!await secureStoreAvailable()) {
    await AsyncStorage.setItem(SESSION_KEY, value)
    return
  }
  await SecureStore.setItemAsync(SESSION_KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })
  await AsyncStorage.removeItem(SESSION_KEY)
}

export async function removeStoredSession() {
  if (await secureStoreAvailable()) {
    await SecureStore.deleteItemAsync(SESSION_KEY)
  }
  await AsyncStorage.removeItem(SESSION_KEY)
}
