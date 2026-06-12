import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SessionProvider } from './src/context/SessionProvider'
import { queryClient } from './src/lib/queryClient'
import { AppNavigator } from './src/navigation/AppNavigator'
import { AppVersionGate } from './src/features/app-version/AppVersionGate'

export default function App() {
  return <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <AppVersionGate>
        <StatusBar style="light" />
        <AppNavigator />
      </AppVersionGate>
    </SessionProvider>
  </QueryClientProvider>
}
