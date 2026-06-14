import { api } from '../../api/client'
import type { ChatMessage } from '../../types'

export const chatApi = {
  messages: (requestId: string) => api.get<ChatMessage[]>(`/v1/service-requests/${requestId}/chat`).then(({ data }) => data),
  read: (requestId: string) => api.put(`/v1/service-requests/${requestId}/chat/read`),
  send: (requestId: string, message: string) => api.post(`/v1/service-requests/${requestId}/chat/messages`, { message }),
  report: (messageId: string, reason: string) =>
    api.post(`/v1/chat/messages/${messageId}/report`, { reason }),
}
