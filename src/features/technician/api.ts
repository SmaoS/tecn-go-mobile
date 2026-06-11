import { api } from '../../api/client'
import type { Category, TechnicianProfile } from '../../types'

export const technicianApi = {
  profile: () => api.get<TechnicianProfile>('/v1/technicians/me').then(({ data }) => data),
  categories: () => api.get<Category[]>('/v1/service-categories').then(({ data }) => data),
  saveProfile: (exists: boolean, payload: object) => exists
    ? api.put<TechnicianProfile>('/v1/technicians/me', payload).then(({ data }) => data)
    : api.post<TechnicianProfile>('/v1/technicians/profile', payload).then(({ data }) => data),
  quote: (requestId: string, technicianPrice: number, description?: string) =>
    api.put(`/v1/service-requests/${requestId}/quote`, { technicianPrice, description }),
  location: (payload: object) => api.put('/v1/technicians/me/location', payload),
}
