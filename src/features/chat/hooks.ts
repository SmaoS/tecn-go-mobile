import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from './api'
import { CHAT_POLLING_MS, useSmartPolling } from '../../hooks/useSmartPolling'

export const chatKey = (requestId: string) => ['chat', requestId] as const

export function useChat(requestId: string) {
  const polling = useSmartPolling(CHAT_POLLING_MS)
  return useQuery({
    queryKey: chatKey(requestId),
    queryFn: async () => {
      const messages = await chatApi.messages(requestId)
      await chatApi.read(requestId)
      return messages
    },
    ...polling,
  })
}

export function useSendMessage(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => chatApi.send(requestId, message),
    onSuccess: () => client.invalidateQueries({ queryKey: chatKey(requestId) }),
  })
}

export function useReportMessage(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => chatApi.report(
      messageId,
      'Contenido inapropiado reportado desde la aplicación móvil',
    ),
    onSuccess: () => client.invalidateQueries({ queryKey: chatKey(requestId) }),
  })
}
