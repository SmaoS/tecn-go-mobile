import AsyncStorage from '@react-native-async-storage/async-storage'
import { Linking, Platform } from 'react-native'
import { api } from '../../api/client'
import type { AppVersionCheck } from '../../types'
import {
  checkAppVersion,
  getCurrentAppVersion,
  LAST_RECOMMENDED_VERSION_SHOWN_AT_KEY,
  LAST_VERSION_CHECK_AT_KEY,
  openStore,
  shouldCheckVersion,
} from './VersionCheckService'

const response: AppVersionCheck = {
  platform: 'ANDROID',
  currentVersion: '1.0.0',
  latestVersion: '1.1.0',
  minimumSupportedVersion: '1.0.0',
  updateRequired: true,
  forceUpdate: false,
  updateUrl: 'https://play.google.com/store/apps/details?id=com.tecngo',
  message: 'Hay una nueva versión disponible.',
}

describe('VersionCheckService', () => {
  const originalOS = Platform.OS

  beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' })
    process.env.EXPO_PUBLIC_ENFORCE_VERSION_CHECK = 'true'
    jest.spyOn(api, 'get')
  })

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS })
  })

  it('consulta versión y evita llamadas repetidas por 5 minutos', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: response } as never)

    await expect(shouldCheckVersion()).resolves.toBe(true)
    await expect(checkAppVersion()).resolves.toEqual(response)
    await expect(shouldCheckVersion()).resolves.toBe(false)
    await expect(checkAppVersion()).resolves.toBeUndefined()

    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/v1/app-version/check', {
      params: {
        platform: 'ANDROID',
        currentVersion: getCurrentAppVersion(),
      },
    })
  })

  it('muestra recomendada máximo una vez al día pero no oculta forzosa', async () => {
    jest.mocked(api.get)
      .mockResolvedValueOnce({ data: response } as never)
      .mockResolvedValueOnce({ data: response } as never)
      .mockResolvedValueOnce({ data: { ...response, forceUpdate: true } } as never)

    await expect(checkAppVersion({ ignoreThrottle: true })).resolves.toEqual(response)
    await expect(checkAppVersion({ ignoreThrottle: true })).resolves.toBeUndefined()
    await expect(checkAppVersion({ ignoreThrottle: true })).resolves.toEqual({ ...response, forceUpdate: true })

    expect(await AsyncStorage.getItem(LAST_VERSION_CHECK_AT_KEY)).toBeTruthy()
    expect(await AsyncStorage.getItem(LAST_RECOMMENDED_VERSION_SHOWN_AT_KEY)).toBeTruthy()
  })

  it('abre la tienda cuando existe url', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)

    await openStore(response)

    expect(openUrl).toHaveBeenCalledWith(response.updateUrl)
  })
})
