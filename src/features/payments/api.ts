import { api } from '../../api/client'
import type { FinancialSummary } from '../../types'

export const paymentsApi = {
  technicianEarnings: () => api.get<FinancialSummary>('/v1/technicians/me/earnings').then(({ data }) => data),
}
