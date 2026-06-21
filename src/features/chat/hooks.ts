import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from './api'
import { CHAT_POLLING_MS, useSmartPolling } from '../../hooks/useSmartPolling'
import type { ChatMessage } from '../../types'

export const chatKey = (requestId: string) => ['chat', requestId] as const

export function useChat(requestId: string) {
  const polling = useSmartPolling(CHAT_POLLING_MS)
  const client = useQueryClient()
  return useQuery({
    queryKey: chatKey(requestId),
    queryFn: async () => {
      const current = client.getQueryData<ChatMessage[]>(chatKey(requestId)) ?? []
      const messages = await chatApi.messages(requestId, current.at(-1)?.createdAt)
      await chatApi.read(requestId)
      const byId = new Map(current.map((item) => [item.id, item]))
      messages.forEach((item) => byId.set(item.id, item))
      return [...byId.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
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
