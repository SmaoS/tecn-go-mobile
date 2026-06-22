import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import {
  getStoredSession,
  removeStoredSession,
  SESSION_KEY,
  setStoredSession,
} from './sessionStorage'

const secureStore = SecureStore as jest.Mocked<typeof SecureStore>

describe('sessionStorage', () => {
  const originalOS = Platform.OS

  beforeEach(async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' })
    jest.clearAllMocks()
    await AsyncStorage.clear()
    secureStore.isAvailableAsync.mockResolvedValue(true)
    secureStore.getItemAsync.mockResolvedValue(null)
  })

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS })
  })

  it('lee la sesión desde SecureStore en dispositivos', async () => {
    secureStore.getItemAsync.mockResolvedValue('secure-session')

    await expect(getStoredSession()).resolves.toBe('secure-session')

    expect(secureStore.getItemAsync).toHaveBeenCalledWith(SESSION_KEY)
    expect(AsyncStorage.getItem).not.toHaveBeenCalled()
  })

  it('migra una sesión heredada de AsyncStorage a SecureStore', async () => {
    await AsyncStorage.setItem(SESSION_KEY, 'legacy-session')

    await expect(getStoredSession()).resolves.toBe('legacy-session')

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_KEY,
      'legacy-session',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    )
    await expect(AsyncStorage.getItem(SESSION_KEY)).resolves.toBeNull()
  })

  it('usa AsyncStorage en web sin consultar SecureStore', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' })
    await AsyncStorage.setItem(SESSION_KEY, 'web-session')

    await expect(getStoredSession()).resolves.toBe('web-session')

    expect(secureStore.isAvailableAsync).not.toHaveBeenCalled()
  })

  it('guarda y elimina la sesión segura junto con cualquier copia heredada', async () => {
    await AsyncStorage.setItem(SESSION_KEY, 'stale-session')

    await setStoredSession('new-session')
    await removeStoredSession()

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_KEY,
      'new-session',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    )
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY)
    await expect(AsyncStorage.getItem(SESSION_KEY)).resolves.toBeNull()
  })
})
