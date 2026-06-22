import { act, renderHook, waitFor } from '@testing-library/react-native'
import { createQueryWrapper } from '../../test/render'
import { serviceSupportApi } from './api'
import { useServiceSupport } from './hooks'

jest.mock('./api', () => ({
  serviceSupportApi: {
    evidences: jest.fn(),
    proofs: jest.fn(),
    uploadEvidence: jest.fn(),
    uploadProof: jest.fn(),
    reportContent: jest.fn(),
    report: jest.fn(),
  },
}))

describe('service support hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(serviceSupportApi.evidences).mockResolvedValue([])
    jest.mocked(serviceSupportApi.proofs).mockResolvedValue([])
  })

  it('carga evidencias y comprobantes', async () => {
    const { QueryWrapper } = createQueryWrapper()
    const hook = renderHook(() => useServiceSupport('request-1'), { wrapper: QueryWrapper })

    await waitFor(() => expect(hook.result.current.evidences.isSuccess).toBe(true))
    await waitFor(() => expect(hook.result.current.proofs.isSuccess).toBe(true))
    expect(serviceSupportApi.evidences).toHaveBeenCalledWith('request-1')
    expect(serviceSupportApi.proofs).toHaveBeenCalledWith('request-1')
  })

  it('ejecuta evidencia, comprobante y denuncias e invalida ambas listas', async () => {
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    const hook = renderHook(() => useServiceSupport('request-1'), { wrapper: QueryWrapper })

    await act(async () => {
      await hook.result.current.action.mutateAsync({
        kind: 'evidence',
        evidenceType: 'BEFORE_SERVICE',
        description: 'Antes del trabajo',
      })
      await hook.result.current.action.mutateAsync({
        kind: 'proof',
        amount: 120000,
        paymentMethod: 'TRANSFER',
      })
      await hook.result.current.action.mutateAsync({
        kind: 'contentReport',
        contentAssetId: 'asset-1',
        reason: 'Contenido inapropiado',
      })
      await hook.result.current.action.mutateAsync({
        kind: 'report',
        description: 'Problema con el servicio',
      })
    })

    expect(serviceSupportApi.uploadEvidence)
      .toHaveBeenCalledWith('request-1', 'BEFORE_SERVICE', 'Antes del trabajo')
    expect(serviceSupportApi.uploadProof)
      .toHaveBeenCalledWith('request-1', 120000, 'TRANSFER')
    expect(serviceSupportApi.reportContent)
      .toHaveBeenCalledWith('asset-1', 'Contenido inapropiado')
    expect(serviceSupportApi.report)
      .toHaveBeenCalledWith('request-1', 'OTHER', 'Problema con el servicio')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['service-evidence', 'request-1'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['payment-proofs', 'request-1'] })
  })
})
