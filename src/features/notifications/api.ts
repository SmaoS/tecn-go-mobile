import { api } from '../../api/client'
import type { UnreadCount, UserNotification } from '../../types'

export const notificationsApi = {
  all: (after?: string) => api.get<UserNotification[]>('/v1/notifications', {
    params: { after, limit: 50 },
  }).then(({ data }) => data),
  unread: () => api.get<UnreadCount>('/v1/notifications/unread-count').then(({ data }) => data.count),
  read: (id: string) => api.put(`/v1/notifications/${id}/read`),
  delete: (id: string) => api.delete(`/v1/notifications/${id}`),
}
