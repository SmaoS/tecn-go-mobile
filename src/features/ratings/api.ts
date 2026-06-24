import { api } from '../../api/client'
import type { RatingResponse } from '../../types'

export const ratingsApi = {
  create: (requestId: string, score: number, comment: string) =>
    api.post(`/v1/service-requests/${requestId}/ratings`, { score, comment }),
  status: (requestId: string) =>
    api.get<{ rated: boolean }>(`/v1/service-requests/${requestId}/ratings/me`).then(({ data }) => data),
  technicianRatings: (technicianUserId: string) =>
    api.get<RatingResponse[]>(`/v1/technicians/${technicianUserId}/ratings`).then(({ data }) => data),
}
