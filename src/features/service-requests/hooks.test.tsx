import { act, renderHook, waitFor } from '@testing-library/react-native'
import { createQueryWrapper } from '../../test/render'
import { quoteFixture, serviceRequestFixture } from '../../test/fixtures'
import { serviceRequestApi } from './api'
import {
  useAssignedRequestHistory,
  useAssignedRequests,
  requestKeys,
  useAdvanceRequest,
  useAvailableRequests,
  useClientRequestHistory,
  useClientRequests,
  useCreateRequest,
  useNearbyTechnicians,
  useNotificationRequest,
  useRecentClientQuotes,
  useRequestAction,
  useRequestDetail,
  useRequestQuotes,
  useServiceCategories,
  useTechnicianLocation,
} from './hooks'
import { uploadServiceImage } from '../../services/files'

jest.mock('./api', () => ({
  serviceRequestApi: {
    available: jest.fn(),
    clientRequests: jest.fn(),
    clientHistory: jest.fn(),
    assigned: jest.fn(),
    assignedHistory: jest.fn(),
    categories: jest.fn(),
    detail: jest.fn(),
    quotes: jest.fn(),
    nearbyTechnicians: jest.fn(),
    technicianLocation: jest.fn(),
    confirmQuote: jest.fn(),
    rejectQuote: jest.fn(),
    status: jest.fn(),
    create: jest.fn(),
    technicianComplete: jest.fn(),
  },
}))
jest.mock('../../services/files', () => ({ uploadServiceImage: jest.fn() }))
jest.mock('../../hooks/useSmartPolling', () => ({
  useSmartPolling: jest.fn(() => ({ enabled: true, refetchInterval: false })),
}))

describe('service request hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('consulta solicitudes disponibles usando filtros como parte de la clave', async () => {
    const search = { cityId: 'city-1', categoryId: 'category-1' }
    jest.mocked(serviceRequestApi.available).mockResolvedValue([serviceRequestFixture()])
    const { QueryWrapper } = createQueryWrapper()

    const hook = renderHook(() => useAvailableRequests(search), { wrapper: QueryWrapper })

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true))
    expect(serviceRequestApi.available).toHaveBeenCalledWith(search)
    expect(hook.result.current.data).toHaveLength(1)
  })

  it('cubre listas principales, historiales y categorías', async () => {
    const items = [serviceRequestFixture()]
    jest.mocked(serviceRequestApi.clientRequests).mockResolvedValue(items)
    jest.mocked(serviceRequestApi.clientHistory).mockResolvedValue(items)
    jest.mocked(serviceRequestApi.assigned).mockResolvedValue(items)
    jest.mocked(serviceRequestApi.assignedHistory).mockResolvedValue(items)
    jest.mocked(serviceRequestApi.categories).mockResolvedValue([])
    const { QueryWrapper } = createQueryWrapper()
    const client = renderHook(useClientRequests, { wrapper: QueryWrapper })
    const clientHistory = renderHook(useClientRequestHistory, { wrapper: QueryWrapper })
    const assigned = renderHook(useAssignedRequests, { wrapper: QueryWrapper })
    const assignedHistory = renderHook(useAssignedRequestHistory, { wrapper: QueryWrapper })
    const categories = renderHook(useServiceCategories, { wrapper: QueryWrapper })

    await waitFor(() => expect(client.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(clientHistory.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(assigned.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(assignedHistory.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(categories.result.current.isSuccess).toBe(true))
    expect(client.result.current.data).toEqual(items)
    expect(assigned.result.current.data).toEqual(items)
  })

  it('consulta detalle, notificación y cotizaciones por solicitud', async () => {
    const request = serviceRequestFixture()
    jest.mocked(serviceRequestApi.detail).mockResolvedValue(request)
    jest.mocked(serviceRequestApi.quotes).mockResolvedValue([quoteFixture()])
    const { QueryWrapper } = createQueryWrapper()
    const detail = renderHook(() => useRequestDetail(request), { wrapper: QueryWrapper })
    const notification = renderHook(() => useNotificationRequest(request.id), {
      wrapper: QueryWrapper,
    })
    const quotes = renderHook(() => useRequestQuotes(request.id), { wrapper: QueryWrapper })

    await waitFor(() => expect(serviceRequestApi.detail).toHaveBeenCalled())
    await waitFor(() => expect(quotes.result.current.isSuccess).toBe(true))
    expect(detail.result.current.data?.id).toBe(request.id)
    expect(notification.result.current.data?.id).toBe(request.id)
    expect(quotes.result.current.data?.[0]?.id).toBe('quote-1')
  })

  it('agrupa cotizaciones recientes y consulta cercanía y ubicación asignada', async () => {
    const first = serviceRequestFixture({
      id: 'request-1',
      status: 'QUOTE_PENDING',
    })
    const second = serviceRequestFixture({
      id: 'request-2',
      status: 'QUOTE_PENDING',
    })
    jest.mocked(serviceRequestApi.quotes).mockImplementation(async (id) => [
      quoteFixture({
        id: `quote-${id}`,
        serviceRequestId: id,
        createdAt: id === 'request-2'
          ? '2026-06-22T11:00:00Z'
          : '2026-06-22T10:00:00Z',
      }),
    ])
    jest.mocked(serviceRequestApi.nearbyTechnicians).mockResolvedValue([])
    jest.mocked(serviceRequestApi.technicianLocation).mockResolvedValue({
      technicianId: 'technician-1',
      technicianName: 'Técnico',
      latitude: 4.14,
      longitude: -73.63,
      locationPrecision: 'EXACT',
      online: true,
      updatedAt: '2026-06-22T11:00:00Z',
    })
    const { QueryWrapper } = createQueryWrapper()
    const recent = renderHook(() => useRecentClientQuotes([first, second]), {
      wrapper: QueryWrapper,
    })
    const nearby = renderHook(() => useNearbyTechnicians(4.14, -73.63, 'city-1'), {
      wrapper: QueryWrapper,
    })
    const location = renderHook(() => useTechnicianLocation(serviceRequestFixture({
      status: 'ON_THE_WAY',
      technicianId: 'technician-1',
    })), { wrapper: QueryWrapper })

    await waitFor(() => expect(recent.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(nearby.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(location.result.current.isSuccess).toBe(true))
    expect(recent.result.current.data?.map((item) => item.request.id))
      .toEqual(['request-2', 'request-1'])
    expect(serviceRequestApi.nearbyTechnicians)
      .toHaveBeenCalledWith(4.14, -73.63, 25, 'city-1')
    expect(serviceRequestApi.technicianLocation).toHaveBeenCalledWith('request-1')
  })

  it('ejecuta acciones y actualiza todas las listas relacionadas', async () => {
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    jest.mocked(serviceRequestApi.confirmQuote).mockResolvedValue({} as never)
    jest.mocked(serviceRequestApi.rejectQuote).mockResolvedValue({} as never)
    jest.mocked(serviceRequestApi.status).mockResolvedValue({} as never)
    const hook = renderHook(() => useRequestAction('request-1'), { wrapper: QueryWrapper })

    await act(async () => {
      await hook.result.current.mutateAsync({
        kind: 'confirmQuote',
        quoteId: 'quote-1',
      })
    })
    await act(async () => {
      await hook.result.current.mutateAsync({
        kind: 'rejectQuote',
        quoteId: 'quote-1',
      })
    })
    await act(async () => {
      await hook.result.current.mutateAsync({
        kind: 'status',
        status: 'ON_THE_WAY',
      })
    })

    expect(serviceRequestApi.confirmQuote).toHaveBeenCalledWith('request-1', 'quote-1')
    expect(serviceRequestApi.rejectQuote).toHaveBeenCalledWith('request-1', 'quote-1')
    expect(serviceRequestApi.status).toHaveBeenCalledWith('request-1', 'ON_THE_WAY')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestKeys.detail('request-1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestKeys.client })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestKeys.assigned })
  })

  it('crea la solicitud, carga sus imágenes en orden y luego ejecuta onSuccess', async () => {
    const created = serviceRequestFixture()
    const completed = jest.fn()
    jest.mocked(serviceRequestApi.create).mockResolvedValue(created)
    jest.mocked(uploadServiceImage).mockResolvedValue({} as never)
    const { QueryWrapper } = createQueryWrapper()
    const hook = renderHook(() => useCreateRequest(completed), { wrapper: QueryWrapper })
    const images = [
      { uri: 'file://one.jpg', name: 'one.jpg', mimeType: 'image/jpeg' },
      { uri: 'file://two.jpg', name: 'two.jpg', mimeType: 'image/jpeg' },
    ]

    await act(async () => {
      await hook.result.current.mutateAsync({ payload: { description: 'Trabajo' }, images })
    })

    expect(uploadServiceImage).toHaveBeenNthCalledWith(1, created.id, images[0])
    expect(uploadServiceImage).toHaveBeenNthCalledWith(2, created.id, images[1])
    expect(completed).toHaveBeenCalled()
  })

  it('distingue avance de estado y cierre técnico', async () => {
    jest.mocked(serviceRequestApi.status).mockResolvedValue(serviceRequestFixture() as never)
    jest.mocked(serviceRequestApi.technicianComplete).mockResolvedValue(serviceRequestFixture() as never)
    const { QueryWrapper } = createQueryWrapper()
    const hook = renderHook(() => useAdvanceRequest(), { wrapper: QueryWrapper })

    await act(async () => {
      await hook.result.current.mutateAsync({
        requestId: 'request-1',
        status: 'ARRIVED',
      })
    })
    await act(async () => {
      await hook.result.current.mutateAsync({
        requestId: 'request-1',
        paymentReceived: true,
        paymentMethod: 'CASH',
      })
    })

    expect(serviceRequestApi.status).toHaveBeenCalledWith('request-1', 'ARRIVED')
    expect(serviceRequestApi.technicianComplete).toHaveBeenCalledWith('request-1', {
      paymentReceived: true,
      paymentMethod: 'CASH',
      comment: undefined,
    })
  })
})
