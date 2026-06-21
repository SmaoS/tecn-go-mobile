import { api } from '../../api/client'
import type { Category, NearbyTechnician, PageResponse, ServiceQuote, ServiceRequest, TechnicianLocation } from '../../types'

export interface AvailableRequestSearch {
  cityId?: string
  categoryId?: string
  useRadius?: boolean
  radiusKm?: number
}

export const serviceRequestApi = {
  categories: () => api.get<Category[]>('/v1/services').then(({ data }) => data),
  clientRequests: () => api.get<PageResponse<ServiceRequest>>('/v1/service-requests/my/page?activeOnly=true&page=0&size=20').then(({ data }) => data.content),
  clientHistory: () => api.get<PageResponse<ServiceRequest>>('/v1/service-requests/my/history/page?page=0&size=20').then(({ data }) => data.content),
  detail: (requestId: string) => api.get<ServiceRequest>(`/v1/service-requests/${requestId}`).then(({ data }) => data),
  assigned: () => api.get<PageResponse<ServiceRequest>>('/v1/service-requests/my-assigned/page?activeOnly=true&page=0&size=20').then(({ data }) => data.content),
  assignedHistory: () => api.get<PageResponse<ServiceRequest>>('/v1/service-requests/my-assigned/history/page?page=0&size=20').then(({ data }) => data.content),
  available: (search: AvailableRequestSearch = {}) =>
    api.get<PageResponse<ServiceRequest>>('/v1/service-requests/available/page', {
      params: { ...search, page: 0, size: 30 },
    }).then(({ data }) => data.content),
  quotes: (requestId: string) => api.get<ServiceQuote[]>(`/v1/service-requests/${requestId}/quotes`).then(({ data }) => data),
  technicianLocation: (requestId: string) => api.get<TechnicianLocation>(`/v1/service-requests/${requestId}/technician-location`).then(({ data }) => data),
  nearbyTechnicians: (latitude: number, longitude: number, radiusKm = 25, cityId?: string) =>
    api.get<NearbyTechnician[]>('/v1/technicians/nearby', { params: { latitude, longitude, radiusKm, cityId } }).then(({ data }) => data),
  create: (payload: object) => api.post<ServiceRequest>('/v1/service-requests', payload).then(({ data }) => data),
  status: (requestId: string, status: string) => api.put<ServiceRequest>(`/v1/service-requests/${requestId}/status`, { status }).then(({ data }) => data),
  technicianComplete: (requestId: string, input: { paymentReceived: boolean; paymentMethod?: string; comment?: string }) =>
    api.post<ServiceRequest>(`/v1/service-requests/${requestId}/technician-complete`, input).then(({ data }) => data),
  confirmQuote: (requestId: string, quoteId: string) => api.put<ServiceRequest>(`/v1/service-requests/${requestId}/confirm-quote`, { quoteId }).then(({ data }) => data),
  rejectQuote: (requestId: string, quoteId: string) => api.put(`/v1/service-requests/${requestId}/quotes/${quoteId}/reject`),
}
