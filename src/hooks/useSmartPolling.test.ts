import { renderHook } from '@testing-library/react-native'
import { useIsFocused } from '@react-navigation/native'
import { CHAT_POLLING_MS, STANDARD_POLLING_MS, useSmartPolling } from './useSmartPolling'

jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn(),
}))

describe('useSmartPolling', () => {
  beforeEach(() => jest.clearAllMocks())

  it('activa polling estándar únicamente con la pantalla enfocada', () => {
    jest.mocked(useIsFocused).mockReturnValue(true)
    const focused = renderHook(() => useSmartPolling()).result.current
    expect(focused).toEqual({ enabled: true, refetchInterval: STANDARD_POLLING_MS })

    jest.mocked(useIsFocused).mockReturnValue(false)
    const blurred = renderHook(() => useSmartPolling()).result.current
    expect(blurred).toEqual({ enabled: false, refetchInterval: false })
  })

  it('respeta intervalos especializados y estado deshabilitado', () => {
    jest.mocked(useIsFocused).mockReturnValue(true)

    expect(renderHook(() => useSmartPolling(CHAT_POLLING_MS)).result.current)
      .toEqual({ enabled: true, refetchInterval: CHAT_POLLING_MS })
    expect(renderHook(() => useSmartPolling(STANDARD_POLLING_MS, false)).result.current)
      .toEqual({ enabled: false, refetchInterval: false })
  })
})
