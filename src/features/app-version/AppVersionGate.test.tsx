import Constants from 'expo-constants'
import { Linking, Platform } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../../api/client'
import { AppVersionModal, checkAppVersionBeforeLogin } from './AppVersionGate'
import type { AppVersionCheck } from '../../types'

const check: AppVersionCheck = {
  platform: 'ANDROID',
  currentVersion: '1.0.0',
  latestVersion: '1.1.0',
  minimumSupportedVersion: '1.0.0',
  updateRequired: true,
  forceUpdate: false,
  updateUrl: 'https://play.google.com/store/apps/details?id=com.tecngo',
  message: 'Hay una nueva versión disponible.',
}

describe('AppVersionGate', () => {
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

  it('consulta la versión instalada antes del login', async () => {
    jest.mocked(api.get).mockResolvedValue({ data: check } as never)

    await expect(checkAppVersionBeforeLogin()).resolves.toEqual(check)

    expect(api.get).toHaveBeenCalledWith('/v1/app-version/check', {
      params: {
        platform: 'ANDROID',
        currentVersion: Constants.expoConfig?.version ?? '1.0.0',
      },
    })
  })

  it('no bloquea el login cuando el control está desactivado o la API falla', async () => {
    process.env.EXPO_PUBLIC_ENFORCE_VERSION_CHECK = 'false'
    await expect(checkAppVersionBeforeLogin()).resolves.toBeUndefined()
    expect(api.get).not.toHaveBeenCalled()

    process.env.EXPO_PUBLIC_ENFORCE_VERSION_CHECK = 'true'
    jest.mocked(api.get).mockRejectedValue(new Error('offline'))
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    await expect(checkAppVersionBeforeLogin()).resolves.toBeUndefined()
  })

  it('abre Play Store y permite continuar solo si la actualización no es obligatoria', () => {
    const onContinue = jest.fn()
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    const view = render(<AppVersionModal check={check} onContinue={onContinue} />)

    fireEvent.press(view.getByText('Actualizar'))
    fireEvent.press(view.getByText('Más tarde'))

    expect(openUrl).toHaveBeenCalledWith(check.updateUrl)
    expect(onContinue).toHaveBeenCalled()
    view.rerender(<AppVersionModal check={{ ...check, forceUpdate: true }} onContinue={onContinue} />)
    expect(view.queryByText('Más tarde')).toBeNull()
  })
})
