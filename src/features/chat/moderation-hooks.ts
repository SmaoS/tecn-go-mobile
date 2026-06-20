import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatModerationApi } from './moderation-api'
import { useSmartPolling } from '../../hooks/useSmartPolling'

const moderationKey = ['admin', 'chat-moderation'] as const

export function useChatModerationQueue() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: moderationKey,
    queryFn: chatModerationApi.queue,
    ...polling,
  })
}

export function useChatModerationAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; action: 'approve' | 'block' | 'sanction'; reason: string }) =>
      chatModerationApi.decide(input.id, input.action, input.reason),
    onSuccess: () => client.invalidateQueries({ queryKey: moderationKey }),
  })
}
