import { api } from '../../api/client'

export interface ModeratedChatMessage {
  id: string
  serviceRequestId: string
  senderId: string
  senderName: string
  message: string
  moderationStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED'
  moderationReason?: string
  openReports: number
  createdAt: string
}

export const chatModerationApi = {
  queue: () => api.get<ModeratedChatMessage[]>('/v1/admin/chat-moderation/messages')
    .then(({ data }) => data),
  decide: (id: string, action: 'approve' | 'block' | 'sanction', reason: string) =>
    api.put(`/v1/admin/chat-moderation/messages/${id}/${action}`, { reason }),
}
