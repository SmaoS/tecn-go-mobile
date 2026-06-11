import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ServiceRequest } from '../../types'
import { serviceRequestApi } from './api'

export const requestKeys = {
  client: ['service-requests', 'client'] as const,
  assigned: ['service-requests', 'assigned'] as const,
  available: (radiusKm: string) => ['service-requests', 'available', radiusKm] as const,
  detail: (requestId: string) => ['service-requests', 'detail', requestId] as const,
  quotes: (requestId: string) => ['service-requests', 'quotes', requestId] as const,
  location: (requestId: string) => ['service-requests', 'location', requestId] as const,
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

export function useAvailableRequests(radiusKm: string) {
  return useQuery({
    queryKey: requestKeys.available(radiusKm),
    queryFn: () => serviceRequestApi.available(radiusKm),
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
      const requests = await serviceRequestApi.clientRequests()
      return requests.find((item) => item.id === initial.id) ?? initial
    },
  })
}

export function useRequestQuotes(requestId: string) {
  return useQuery({
    queryKey: requestKeys.quotes(requestId),
    queryFn: () => serviceRequestApi.quotes(requestId),
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
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: requestKeys.detail(requestId) }),
        client.invalidateQueries({ queryKey: requestKeys.quotes(requestId) }),
        client.invalidateQueries({ queryKey: requestKeys.client }),
        client.invalidateQueries({ queryKey: requestKeys.assigned }),
      ])
    },
  })
}
