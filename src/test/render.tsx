import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type { ReactElement, ReactNode } from 'react'
import { SessionContext, type SessionContextValue } from '../context/session-context'
import type { Session } from '../types'
import { sessionFixture } from './fixtures'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  })
}

export function createSessionContext(
  session: Session | null = sessionFixture(),
  overrides: Partial<SessionContextValue> = {},
): SessionContextValue {
  return {
    session,
    ready: true,
    setSession: jest.fn(),
    switchMode: jest.fn(async () => undefined),
    logout: jest.fn(async () => undefined),
    ...overrides,
  }
}

export function createQueryWrapper(queryClient = createTestQueryClient()) {
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, QueryWrapper }
}

type ProviderOptions = {
  queryClient?: QueryClient
  session?: Session | null
  sessionContext?: Partial<SessionContextValue>
  withNavigation?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const {
    queryClient = createTestQueryClient(),
    session = sessionFixture(),
    sessionContext: contextOverrides,
    withNavigation = false,
    ...renderOptions
  } = options
  const context = createSessionContext(session, contextOverrides)

  function Providers({ children }: { children: ReactNode }) {
    const content = withNavigation
      ? <NavigationContainer>{children}</NavigationContainer>
      : children
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, right: 0, bottom: 34, left: 0 },
        }}>
          <SessionContext.Provider value={context}>{content}</SessionContext.Provider>
        </SafeAreaProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Providers, ...renderOptions }),
    queryClient,
    sessionContext: context,
  }
}
