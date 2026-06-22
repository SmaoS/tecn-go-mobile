import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import * as Location from 'expo-location'
import { Text, Pressable } from 'react-native'
import { api } from '../api/client'
import * as apiClient from '../api/client'
import { locationTrackingService } from '../services/LocationTrackingService'
import * as sessionStorage from '../services/sessionStorage'
import { technicianApi } from '../features/technician/api'
import { useSession } from './useSession'
import { SessionProvider } from './SessionProvider'
import { sessionFixture } from '../test/fixtures'
import { showToast } from '../components/Toast'

jest.mock('../features/notifications/usePushRegistration', () => ({
  usePushRegistration: jest.fn(),
}))
jest.mock('../services/observability', () => ({
  setObservedUser: jest.fn(),
  captureClientError: jest.fn(),
  Sentry: { addBreadcrumb: jest.fn() },
}))
jest.mock('../components/Toast', () => ({
  showToast: jest.fn(),
}))

function SessionProbe() {
  const context = useSession()
  return <>
    <Text testID="ready">{String(context.ready)}</Text>
    <Text testID="role">{context.session?.role ?? 'NONE'}</Text>
    <Text testID="token">{context.session?.token ?? 'NONE'}</Text>
    <Pressable onPress={() => void context.switchMode('TECHNICIAN')}>
      <Text>Cambiar a técnico</Text>
    </Pressable>
    <Pressable onPress={() => void context.switchMode('CLIENT')}>
      <Text>Cambiar a cliente</Text>
    </Pressable>
    <Pressable onPress={() => void context.logout()}>
      <Text>Cerrar sesión</Text>
    </Pressable>
  </>
}

function renderProvider() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const clear = jest.spyOn(queryClient, 'clear')
  const view = render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider><SessionProbe /></SessionProvider>
    </QueryClientProvider>,
  )
  return { ...view, queryClient, clear }
}

describe('SessionProvider', () => {
  let unauthorizedHandler: (() => void) | undefined

  beforeEach(() => {
    jest.clearAllMocks()
    unauthorizedHandler = undefined
    jest.spyOn(sessionStorage, 'getStoredSession').mockResolvedValue(null)
    jest.spyOn(sessionStorage, 'setStoredSession').mockResolvedValue()
    jest.spyOn(sessionStorage, 'removeStoredSession').mockResolvedValue()
    jest.spyOn(api, 'put')
    jest.spyOn(api, 'post')
    jest.spyOn(locationTrackingService, 'stopTracking').mockResolvedValue()
    jest.spyOn(technicianApi, 'location').mockResolvedValue({} as never)
    jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValue(null)
    jest.spyOn(apiClient, 'setUnauthorizedHandler')
      .mockImplementation((handler: () => void) => { unauthorizedHandler = handler })
  })

  it('restaura la sesión persistida y marca el provider como listo', async () => {
    const stored = sessionFixture({ role: 'CLIENT' })
    jest.mocked(sessionStorage.getStoredSession).mockResolvedValue(JSON.stringify(stored))

    const view = renderProvider()

    await waitFor(() => expect(view.getByTestId('ready').props.children).toBe('true'))
    expect(view.getByTestId('role').props.children).toBe('CLIENT')
    expect(view.getByTestId('token').props.children).toBe('test-jwt-token')
  })

  it('cambia de modo, persiste el nuevo JWT y limpia la caché', async () => {
    const stored = sessionFixture({ role: 'CLIENT', activeMode: 'CLIENT' })
    jest.mocked(sessionStorage.getStoredSession).mockResolvedValue(JSON.stringify(stored))
    jest.mocked(api.put).mockResolvedValue({
      data: {
        token: 'technician-token',
        roles: ['CLIENT', 'TECHNICIAN'],
        activeMode: 'TECHNICIAN',
        roleCreated: true,
        onboardingCompleted: false,
      },
    } as never)
    const view = renderProvider()
    await waitFor(() => expect(view.getByTestId('role').props.children).toBe('CLIENT'))

    fireEvent.press(view.getByText('Cambiar a técnico'))

    await waitFor(() => expect(view.getByTestId('role').props.children).toBe('TECHNICIAN'))
    expect(api.put).toHaveBeenCalledWith('/v1/users/me/active-mode', { mode: 'TECHNICIAN' })
    expect(sessionStorage.setStoredSession).toHaveBeenCalledWith(expect.stringContaining('technician-token'))
    expect(view.clear).toHaveBeenCalled()
    expect(showToast).toHaveBeenCalledWith('Modo técnico creado. Completa tu inscripción')
  })

  it('cierra sesión local aunque el backend no esté disponible', async () => {
    const stored = sessionFixture({
      role: 'TECHNICIAN',
      activeMode: 'TECHNICIAN',
      roles: ['TECHNICIAN'],
    })
    jest.mocked(sessionStorage.getStoredSession).mockResolvedValue(JSON.stringify(stored))
    jest.mocked(api.post).mockRejectedValue(new Error('offline'))
    jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValue({
      coords: {
        latitude: 4.142,
        longitude: -73.626,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    })
    const view = renderProvider()
    await waitFor(() => expect(view.getByTestId('role').props.children).toBe('TECHNICIAN'))

    fireEvent.press(view.getByText('Cerrar sesión'))

    await waitFor(() => expect(view.getByTestId('role').props.children).toBe('NONE'))
    expect(locationTrackingService.stopTracking).toHaveBeenCalledWith(false)
    expect(technicianApi.location).toHaveBeenCalledWith(expect.objectContaining({ online: false }))
    expect(sessionStorage.removeStoredSession).toHaveBeenCalled()
    expect(view.clear).toHaveBeenCalled()
  })

  it('limpia sesión y caché cuando el interceptor informa un 401', async () => {
    const stored = sessionFixture()
    jest.mocked(sessionStorage.getStoredSession).mockResolvedValue(JSON.stringify(stored))
    const view = renderProvider()
    await waitFor(() => expect(view.getByTestId('role').props.children).toBe('CLIENT'))

    act(() => unauthorizedHandler?.())

    expect(view.getByTestId('role').props.children).toBe('NONE')
    expect(view.clear).toHaveBeenCalled()
  })
})
