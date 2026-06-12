import { api } from '../../api/client'

export const ratingsApi = {
  create: (requestId: string, score: number, comment: string) =>
    api.post(`/v1/service-requests/${requestId}/ratings`, { score, comment }),
  status: (requestId: string) =>
    api.get<{ rated: boolean }>(`/v1/service-requests/${requestId}/ratings/me`).then(({ data }) => data),
}
