import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { useSession } from '../context/useSession'
import { sessionFixture } from '../test/fixtures'
import { AppNavigator } from './AppNavigator'

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native')
  const { View } = require('react-native')
  return {
    ...actual,
    NavigationContainer: ({ children }: { children: ReactNode }) =>
      <View>{children}</View>,
  }
})
jest.mock('../context/useSession', () => ({ useSession: jest.fn() }))
jest.mock('./AuthNavigator', () => {
  const { Text } = require('react-native')
  return { AuthNavigator: () => <Text>AUTH_NAVIGATOR</Text> }
})
jest.mock('./ClientNavigator', () => {
  const { Text } = require('react-native')
  return { ClientNavigator: () => <Text>CLIENT_NAVIGATOR</Text> }
})
jest.mock('./TechnicianNavigator', () => ({
  TechnicianNavigator: () => {
    const { Text } = require('react-native')
    return <Text>TECHNICIAN_NAVIGATOR</Text>
  },
}))
jest.mock('./StaffNavigator', () => {
  const { Text } = require('react-native')
  return { StaffNavigator: () => <Text>STAFF_NAVIGATOR</Text> }
})
jest.mock('../services/notifications', () => ({
  addNotificationListeners: jest.fn(() => jest.fn()),
}))
jest.mock('../features/notifications/sync', () => ({
  syncNotificationData: jest.fn(async () => undefined),
}))
jest.mock('../features/payments/api', () => ({
  paymentsApi: { reconcileTechnicianRecharge: jest.fn(async () => undefined) },
}))

function renderNavigator() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <AppNavigator />
    </QueryClientProvider>,
  )
}

describe('AppNavigator', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    [null, 'AUTH_NAVIGATOR'],
    [sessionFixture({ role: 'CLIENT' }), 'CLIENT_NAVIGATOR'],
    [sessionFixture({ role: 'TECHNICIAN', activeMode: 'TECHNICIAN' }), 'TECHNICIAN_NAVIGATOR'],
    [sessionFixture({ role: 'ADMIN', activeMode: undefined }), 'STAFF_NAVIGATOR'],
    [sessionFixture({ role: 'VERIFIER', activeMode: undefined }), 'STAFF_NAVIGATOR'],
  ])('selecciona el navegador correspondiente a la sesión', (session, expected) => {
    jest.mocked(useSession).mockReturnValue({
      session,
      ready: true,
      setSession: jest.fn(),
      switchMode: jest.fn(),
      logout: jest.fn(),
    })

    expect(renderNavigator().getByText(expected)).toBeTruthy()
  })

  it('mantiene una pantalla de carga hasta restaurar la sesión', () => {
    jest.mocked(useSession).mockReturnValue({
      session: null,
      ready: false,
      setSession: jest.fn(),
      switchMode: jest.fn(),
      logout: jest.fn(),
    })

    const view = renderNavigator()

    expect(view.queryByText('AUTH_NAVIGATOR')).toBeNull()
    expect(view.UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy()
  })
})
