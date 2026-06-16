import { api } from '../../api/client'
import type { FinancialSummary, RechargeResponse, TechnicianWallet, TechnicianWalletTransaction } from '../../types'

export const paymentsApi = {
  technicianEarnings: () => api.get<FinancialSummary>('/v1/technicians/me/earnings').then(({ data }) => data),
  technicianWallet: () => api.get<TechnicianWallet>('/v1/technicians/me/wallet').then(({ data }) => data),
  technicianWalletTransactions: () => api.get<TechnicianWalletTransaction[]>('/v1/technicians/me/wallet/transactions').then(({ data }) => data),
  rechargeTechnicianWallet: (amount: number) => api.post<RechargeResponse>('/v1/technicians/me/wallet/recharge', { amount }).then(({ data }) => data),
}
