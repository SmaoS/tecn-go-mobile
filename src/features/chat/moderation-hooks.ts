import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatModerationApi } from './moderation-api'

const moderationKey = ['admin', 'chat-moderation'] as const

export function useChatModerationQueue() {
  return useQuery({
    queryKey: moderationKey,
    queryFn: chatModerationApi.queue,
    refetchInterval: 10_000,
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
