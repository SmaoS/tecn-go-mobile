import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SessionProvider } from './src/context/SessionProvider'
import { queryClient } from './src/lib/queryClient'
import { AppNavigator } from './src/navigation/AppNavigator'
import { ToastHost } from './src/components/Toast'
import { initializeObservability, Sentry } from './src/services/observability'

initializeObservability()

function App() {
  return <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <StatusBar style="light" />
      <AppNavigator />
      <ToastHost />
    </SessionProvider>
  </QueryClientProvider>
}

export default Sentry.wrap(App)
