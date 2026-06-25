import { AppState } from 'react-native'
import { render, waitFor } from '@testing-library/react-native'
import { AppVersionController } from './AppVersionController'
import { checkAppVersion } from './VersionCheckService'
import type { AppVersionCheck } from '../../types'

jest.mock('./VersionCheckService', () => ({
  checkAppVersion: jest.fn(),
  getCurrentAppVersion: jest.fn(() => '1.0.0'),
  openStore: jest.fn(),
}))

const update: AppVersionCheck = {
  platform: 'ANDROID',
  currentVersion: '1.0.0',
  latestVersion: '1.1.0',
  minimumSupportedVersion: '1.0.0',
  updateRequired: true,
  forceUpdate: false,
  updateUrl: 'https://play.google.com/store/apps/details?id=com.tecngo',
  message: 'Hay una nueva versión disponible.',
}

describe('AppVersionController', () => {
  beforeEach(() => jest.clearAllMocks())

  it('ejecuta check al montar y cuando vuelve de background a foreground', async () => {
    let listener: ((state: string) => void) | undefined
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
      listener = callback as (state: string) => void
      return { remove: jest.fn() } as never
    })
    jest.mocked(checkAppVersion).mockResolvedValueOnce(undefined).mockResolvedValueOnce(update)

    const view = render(<AppVersionController />)

    await waitFor(() => expect(checkAppVersion).toHaveBeenCalledTimes(1))
    listener?.('background')
    listener?.('active')

    await view.findByText('Actualización disponible')
    expect(checkAppVersion).toHaveBeenCalledTimes(2)
  })

  it('mantiene modal bloqueante cuando la actualización es obligatoria', async () => {
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never)
    jest.mocked(checkAppVersion).mockResolvedValue({ ...update, forceUpdate: true })

    const view = render(<AppVersionController />)

    await view.findByText('Actualización requerida')
    expect(view.queryByText('Más tarde')).toBeNull()
  })
})
