import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from './api'

export const earningsKey = ['payments', 'technician', 'earnings'] as const

export function useTechnicianEarnings() {
  return useQuery({
    queryKey: earningsKey,
    queryFn: paymentsApi.technicianEarnings,
    refetchInterval: 10_000,
  })
}
