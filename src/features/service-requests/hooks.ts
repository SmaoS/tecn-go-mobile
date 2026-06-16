import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ServiceRequest } from '../../types'
import { serviceRequestApi } from './api'
import { uploadServiceImage } from '../../services/files'

export const requestKeys = {
  client: ['service-requests', 'client'] as const,
  clientHistory: ['service-requests', 'client', 'history'] as const,
  assigned: ['service-requests', 'assigned'] as const,
  assignedHistory: ['service-requests', 'assigned', 'history'] as const,
  available: (radiusKm: string) => ['service-requests', 'available', radiusKm] as const,
  detail: (requestId: string) => ['service-requests', 'detail', requestId] as const,
  quotes: (requestId: string) => ['service-requests', 'quotes', requestId] as const,
  location: (requestId: string) => ['service-requests', 'location', requestId] as const,
  nearbyTechnicians: (latitude: number, longitude: number, cityId?: string) => ['technicians', 'nearby', latitude, longitude, cityId] as const,
  recentQuotes: (requestIds: string[]) => ['service-requests', 'recent-quotes', ...requestIds] as const,
}

export function useClientRequests() {
  return useQuery({
    queryKey: requestKeys.client,
    queryFn: serviceRequestApi.clientRequests,
    refetchInterval: 10_000,
  })
}

export function useAssignedRequests() {
  return useQuery({
    queryKey: requestKeys.assigned,
    queryFn: serviceRequestApi.assigned,
    refetchInterval: 10_000,
  })
}

export function useClientRequestHistory() {
  return useQuery({
    queryKey: requestKeys.clientHistory,
    queryFn: serviceRequestApi.clientHistory,
    refetchInterval: 10_000,
  })
}

export function useAssignedRequestHistory() {
  return useQuery({
    queryKey: requestKeys.assignedHistory,
    queryFn: serviceRequestApi.assignedHistory,
    refetchInterval: 10_000,
  })
}

export function useAvailableRequests(radiusKm: string, enabled = true) {
  return useQuery({
    queryKey: requestKeys.available(radiusKm),
    queryFn: () => serviceRequestApi.available(radiusKm),
    enabled,
    refetchInterval: 10_000,
  })
}

export const categoriesKey = ['service-categories', 'client'] as const

export function useServiceCategories() {
  return useQuery({ queryKey: categoriesKey, queryFn: serviceRequestApi.categories })
}

export function useRequestDetail(initial: ServiceRequest) {
  return useQuery({
    queryKey: requestKeys.detail(initial.id),
    initialData: initial,
    refetchInterval: 10_000,
    queryFn: async () => {
      return serviceRequestApi.detail(initial.id)
    },
  })
}

export function useNotificationRequest(requestId: string) {
  return useQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: () => serviceRequestApi.detail(requestId),
    refetchInterval: 10_000,
  })
}

export function useRequestQuotes(requestId: string) {
  return useQuery({
    queryKey: requestKeys.quotes(requestId),
    queryFn: () => serviceRequestApi.quotes(requestId),
    refetchInterval: 10_000,
  })
}

export function useRecentClientQuotes(requests: ServiceRequest[]) {
  const pending = requests.filter((item) => item.status === 'QUOTE_PENDING')
  return useQuery({
    queryKey: requestKeys.recentQuotes(pending.map((item) => item.id)),
    enabled: pending.length > 0,
    refetchInterval: 10_000,
    queryFn: async () => (await Promise.all(pending.map(async (request) =>
      (await serviceRequestApi.quotes(request.id))
        .filter((quote) => quote.status === 'PENDING')
        .map((quote) => ({ request, quote })),
    ))).flat().sort((a, b) => Date.parse(b.quote.createdAt) - Date.parse(a.quote.createdAt)),
  })
}

export function useNearbyTechnicians(latitude?: number, longitude?: number, cityId?: string) {
  return useQuery({
    queryKey: requestKeys.nearbyTechnicians(latitude ?? 0, longitude ?? 0, cityId),
    queryFn: () => serviceRequestApi.nearbyTechnicians(latitude!, longitude!, 25, cityId),
    enabled: latitude != null && longitude != null,
    refetchInterval: 10_000,
  })
}

export function useTechnicianLocation(request: ServiceRequest) {
  const enabled = Boolean(request.technicianId)
    && ['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(request.status)
  return useQuery({
    queryKey: requestKeys.location(request.id),
    queryFn: () => serviceRequestApi.technicianLocation(request.id),
    enabled,
    refetchInterval: 10_000,
    retry: false,
  })
}

export function useRequestAction(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input:
      | { kind: 'confirmQuote'; quoteId: string }
      | { kind: 'rejectQuote'; quoteId: string }
      | { kind: 'status'; status: string }
      | { kind: 'payCash' }) => {
      if (input.kind === 'confirmQuote') await serviceRequestApi.confirmQuote(requestId, input.quoteId)
      else if (input.kind === 'rejectQuote') await serviceRequestApi.rejectQuote(requestId, input.quoteId)
      else if (input.kind === 'status') await serviceRequestApi.status(requestId, input.status)
      else await serviceRequestApi.payCash(requestId)
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
