import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SessionProvider } from './src/context/SessionProvider'
import { queryClient } from './src/lib/queryClient'
import { AppNavigator } from './src/navigation/AppNavigator'
import { ToastHost } from './src/components/Toast'
import { initializeObservability, Sentry } from './src/services/observability'
import { AppVersionController } from './src/features/app-version/AppVersionController'

initializeObservability()

function App() {
  return <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="light" />
        <AppNavigator />
        <AppVersionController />
        <ToastHost />
      </SessionProvider>
    </SafeAreaProvider>
  </QueryClientProvider>
}

export default Sentry.wrap(App)
