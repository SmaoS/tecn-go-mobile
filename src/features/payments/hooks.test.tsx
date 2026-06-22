import { act, renderHook, waitFor } from '@testing-library/react-native'
import { Linking } from 'react-native'
import { createQueryWrapper } from '../../test/render'
import { paymentsApi } from './api'
import {
  technicianWalletKey,
  technicianWalletTransactionsKey,
  useRechargeTechnicianWallet,
  useTechnicianWallet,
} from './hooks'

jest.mock('./api', () => ({
  paymentsApi: {
    technicianWallet: jest.fn(),
    technicianWalletTransactions: jest.fn(),
    rechargeTechnicianWallet: jest.fn(),
    technicianEarnings: jest.fn(),
  },
}))
jest.mock('../../hooks/useSmartPolling', () => ({
  useSmartPolling: jest.fn(() => ({ enabled: true, refetchInterval: false })),
}))

describe('payment hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('carga saldo y movimientos como consultas independientes', async () => {
    jest.mocked(paymentsApi.technicianWallet).mockResolvedValue({
      technicianId: 'technician-1',
      technicianName: 'Técnico',
      technicianEmail: 'tech@test.local',
      balance: 20000,
      currency: 'COP',
      rechargeEnabled: true,
      lowBalance: false,
      blocked: false,
      lowBalanceMinimum: 10000,
      minRechargeAmount: 10000,
      maxRechargeAmount: 500000,
      totalApprovedRecharges: 20000,
      totalCommissionDebits: 0,
      completedServicesCount: 2,
    })
    jest.mocked(paymentsApi.technicianWalletTransactions).mockResolvedValue([])
    const { QueryWrapper } = createQueryWrapper()

    const hook = renderHook(useTechnicianWallet, { wrapper: QueryWrapper })

    await waitFor(() => expect(hook.result.current.wallet.isSuccess).toBe(true))
    await waitFor(() => expect(hook.result.current.transactions.isSuccess).toBe(true))
    expect(hook.result.current.wallet.data?.balance).toBe(20000)
    expect(hook.result.current.transactions.data).toEqual([])
  })

  it('abre Wompi e invalida saldo y movimientos después de iniciar recarga', async () => {
    jest.mocked(paymentsApi.rechargeTechnicianWallet).mockResolvedValue({
      rechargeId: 'recharge-1',
      reference: 'TECNGO-1',
      amount: 20000,
      currency: 'COP',
      paymentUrl: 'https://checkout.wompi.co/test',
    })
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    const hook = renderHook(useRechargeTechnicianWallet, { wrapper: QueryWrapper })

    await act(async () => { await hook.result.current.mutateAsync(20000) })

    expect(openUrl).toHaveBeenCalledWith('https://checkout.wompi.co/test')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: technicianWalletKey })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: technicianWalletTransactionsKey })
  })
})
