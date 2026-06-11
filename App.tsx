import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SessionProvider } from './src/context/SessionProvider'
import { queryClient } from './src/lib/queryClient'
import { AppNavigator } from './src/navigation/AppNavigator'

export default function App() {
  return <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SessionProvider>
  </QueryClientProvider>
}
