import { useIsFocused } from '@react-navigation/native'

export const STANDARD_POLLING_MS = 10_000
export const CHAT_POLLING_MS = 5_000

export function useSmartPolling(intervalMs = STANDARD_POLLING_MS, enabled = true) {
  const isFocused = useIsFocused()
  const active = enabled && isFocused
  return {
    enabled: active,
    refetchInterval: active ? intervalMs : false as const,
  }
}
