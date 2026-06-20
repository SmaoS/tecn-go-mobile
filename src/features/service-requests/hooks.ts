import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ServiceRequest } from '../../types'
import { serviceRequestApi, type AvailableRequestSearch } from './api'
import { uploadServiceImage } from '../../services/files'
import { useSmartPolling } from '../../hooks/useSmartPolling'

export const requestKeys = {
  client: ['service-requests', 'client'] as const,
  clientHistory: ['service-requests', 'client', 'history'] as const,
  assigned: ['service-requests', 'assigned'] as const,
  assignedHistory: ['service-requests', 'assigned', 'history'] as const,
  available: (search: AvailableRequestSearch = {}) => ['service-requests', 'available', search] as const,
  availableRoot: ['service-requests', 'available'] as const,
  detail: (requestId: string) => ['service-requests', 'detail', requestId] as const,
  quotes: (requestId: string) => ['service-requests', 'quotes', requestId] as const,
  location: (requestId: string) => ['service-requests', 'location', requestId] as const,
  nearbyTechnicians: (latitude: number, longitude: number, cityId?: string) => ['technicians', 'nearby', latitude, longitude, cityId] as const,
  recentQuotes: (requestIds: string[]) => ['service-requests', 'recent-quotes', ...requestIds] as const,
}

export function useClientRequests() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.client,
    queryFn: serviceRequestApi.clientRequests,
    ...polling,
  })
}

export function useAssignedRequests() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.assigned,
    queryFn: serviceRequestApi.assigned,
    ...polling,
  })
}

export function useClientRequestHistory() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.clientHistory,
    queryFn: serviceRequestApi.clientHistory,
    ...polling,
  })
}

export function useAssignedRequestHistory() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.assignedHistory,
    queryFn: serviceRequestApi.assignedHistory,
    ...polling,
  })
}

export function useAvailableRequests(search: AvailableRequestSearch = {}, enabled = true) {
  const polling = useSmartPolling(10_000, enabled)
  return useQuery({
    queryKey: requestKeys.available(search),
    queryFn: () => serviceRequestApi.available(search),
    ...polling,
  })
}

export const categoriesKey = ['service-categories', 'client'] as const

export function useServiceCategories() {
  return useQuery({ queryKey: categoriesKey, queryFn: serviceRequestApi.categories })
}

export function useRequestDetail(initial: ServiceRequest) {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.detail(initial.id),
    initialData: initial,
    ...polling,
    queryFn: async () => {
      return serviceRequestApi.detail(initial.id)
    },
  })
}

export function useNotificationRequest(requestId: string) {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: () => serviceRequestApi.detail(requestId),
    ...polling,
  })
}

export function useRequestQuotes(requestId: string) {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: requestKeys.quotes(requestId),
    queryFn: () => serviceRequestApi.quotes(requestId),
    ...polling,
  })
}

export function useRecentClientQuotes(requests: ServiceRequest[]) {
  const pending = requests.filter((item) => item.status === 'QUOTE_PENDING')
  const polling = useSmartPolling(10_000, pending.length > 0)
  return useQuery({
    queryKey: requestKeys.recentQuotes(pending.map((item) => item.id)),
    ...polling,
    queryFn: async () => (await Promise.all(pending.map(async (request) =>
      (await serviceRequestApi.quotes(request.id))
        .filter((quote) => quote.status === 'PENDING')
        .map((quote) => ({ request, quote })),
    ))).flat().sort((a, b) => Date.parse(b.quote.createdAt) - Date.parse(a.quote.createdAt)),
  })
}

export function useNearbyTechnicians(latitude?: number, longitude?: number, cityId?: string) {
  const polling = useSmartPolling(10_000, latitude != null && longitude != null)
  return useQuery({
    queryKey: requestKeys.nearbyTechnicians(latitude ?? 0, longitude ?? 0, cityId),
    queryFn: () => serviceRequestApi.nearbyTechnicians(latitude!, longitude!, 25, cityId),
    ...polling,
  })
}

export function useTechnicianLocation(request: ServiceRequest) {
  const enabled = Boolean(request.technicianId)
    && ['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(request.status)
  const polling = useSmartPolling(10_000, enabled)
  return useQuery({
    queryKey: requestKeys.location(request.id),
    queryFn: () => serviceRequestApi.technicianLocation(request.id),
    ...polling,
    retry: false,
  })
}

export function useRequestAction(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input:
      | { kind: 'confirmQuote'; quoteId: string }
      | { kind: 'rejectQuote'; quoteId: string }
      | { kind: 'status'; status: string }) => {
      if (input.kind === 'confirmQuote') await serviceRequestApi.confirmQuote(requestId, input.quoteId)
      else if (input.kind === 'rejectQuote') await serviceRequestApi.rejectQuote(requestId, input.quoteId)
      else await serviceRequestApi.status(requestId, input.status)
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: requestKeys.detail(requestId) }),
        client.invalidateQueries({ queryKey: requestKeys.quotes(requestId) }),
        client.invalidateQueries({ queryKey: requestKeys.client }),
        client.invalidateQueries({ queryKey: requestKeys.assigned }),
        client.invalidateQueries({ queryKey: requestKeys.clientHistory }),
        client.invalidateQueries({ queryKey: requestKeys.assignedHistory }),
      ])
    },
  })
}

export function useCreateRequest(onSuccess: () => void) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ payload, images }: {
      payload: object
      images: { uri: string; name: string; mimeType: string }[]
    }) => {
      const request = await serviceRequestApi.create(payload)
      for (const image of images) await uploadServiceImage(request.id, image)
      return request
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: requestKeys.client })
      onSuccess()
    },
  })
}

export function useAdvanceRequest() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, status, paymentReceived, paymentMethod, comment }: {
      requestId: string
      status?: string
      paymentReceived?: boolean
      paymentMethod?: string
      comment?: string
    }) => status
      ? serviceRequestApi.status(requestId, status)
      : serviceRequestApi.technicianComplete(requestId, { paymentReceived: Boolean(paymentReceived), paymentMethod, comment }),
    onSuccess: () => client.invalidateQueries({ queryKey: requestKeys.assigned }),
  })
}
