import { api } from '../../api/client'
import type { Category, NearbyTechnician, ServiceQuote, ServiceRequest, TechnicianLocation } from '../../types'

export interface AvailableRequestSearch {
  cityId?: string
  categoryId?: string
  useRadius?: boolean
  radiusKm?: number
}

export const serviceRequestApi = {
  categories: () => api.get<Category[]>('/v1/services').then(({ data }) => data),
  clientRequests: () => api.get<ServiceRequest[]>('/v1/service-requests/my?activeOnly=true').then(({ data }) => data),
  clientHistory: () => api.get<ServiceRequest[]>('/v1/service-requests/my/history').then(({ data }) => data),
  detail: (requestId: string) => api.get<ServiceRequest>(`/v1/service-requests/${requestId}`).then(({ data }) => data),
  assigned: () => api.get<ServiceRequest[]>('/v1/service-requests/my-assigned?activeOnly=true').then(({ data }) => data),
  assignedHistory: () => api.get<ServiceRequest[]>('/v1/service-requests/my-assigned/history').then(({ data }) => data),
  available: (search: AvailableRequestSearch = {}) =>
    api.get<ServiceRequest[]>('/v1/service-requests/available', { params: search }).then(({ data }) => data),
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
