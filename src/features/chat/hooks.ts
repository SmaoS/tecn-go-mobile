import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from './api'

const chatKey = (requestId: string) => ['chat', requestId] as const

export function useChat(requestId: string) {
  return useQuery({
    queryKey: chatKey(requestId),
    queryFn: async () => {
      const messages = await chatApi.messages(requestId)
      await chatApi.read(requestId)
      return messages
    },
    refetchInterval: 5_000,
  })
}

export function useSendMessage(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => chatApi.send(requestId, message),
    onSuccess: () => client.invalidateQueries({ queryKey: chatKey(requestId) }),
  })
}
