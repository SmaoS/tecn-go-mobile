import { Linking } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from './api'
import { useSmartPolling } from '../../hooks/useSmartPolling'

export const earningsKey = ['payments', 'technician', 'earnings'] as const
export const technicianWalletKey = ['technicians', 'me', 'wallet'] as const
export const technicianWalletTransactionsKey = ['technicians', 'me', 'wallet', 'transactions'] as const

export function useTechnicianEarnings() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: earningsKey,
    queryFn: paymentsApi.technicianEarnings,
    ...polling,
  })
}

export function useTechnicianWallet() {
  const polling = useSmartPolling()
  const wallet = useQuery({
    queryKey: technicianWalletKey,
    queryFn: paymentsApi.technicianWallet,
    ...polling,
  })
  const transactions = useQuery({
    queryKey: technicianWalletTransactionsKey,
    queryFn: paymentsApi.technicianWalletTransactions,
    ...polling,
  })
  return { wallet, transactions }
}

export function useRechargeTechnicianWallet() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: paymentsApi.rechargeTechnicianWallet,
    onSuccess: async (response) => {
      await Linking.openURL(response.paymentUrl)
      await client.invalidateQueries({ queryKey: technicianWalletKey })
      await client.invalidateQueries({ queryKey: technicianWalletTransactionsKey })
    },
  })
}
