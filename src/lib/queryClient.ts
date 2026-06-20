import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'

if (Platform.OS !== 'web') {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (state) => {
      handleFocus(state === 'active')
    })
    return () => subscription.remove()
  })
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: false,
    },
  },
})
