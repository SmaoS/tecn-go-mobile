import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from './api'
import { useSmartPolling } from '../../hooks/useSmartPolling'
import type { UserNotification } from '../../types'

export const notificationKeys = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread-count'] as const,
}

export function useNotifications() {
  const polling = useSmartPolling()
  const client = useQueryClient()
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: async () => {
      const current = client.getQueryData<UserNotification[]>(notificationKeys.all) ?? []
      const incoming = await notificationsApi.all(current[0]?.createdAt)
      const byId = new Map(current.map((item) => [item.id, item]))
      incoming.forEach((item) => byId.set(item.id, item))
      return [...byId.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    },
    ...polling,
  })
}

export function useUnreadNotifications() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationsApi.unread,
    ...polling,
  })
}

export function useMarkNotificationRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (item: { id: string; read: boolean }) => {
      if (!item.read) await notificationsApi.read(item.id)
    },
    onSuccess: async (_, item) => {
      if (!item.read) {
        client.setQueryData<UserNotification[]>(notificationKeys.all,
          (items = []) => items.map((current) =>
            current.id === item.id ? { ...current, read: true } : current))
      }
      await client.invalidateQueries({ queryKey: notificationKeys.unread })
    },
  })
}

export function useDeleteNotification() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: async (_, id) => {
      client.setQueryData<UserNotification[]>(notificationKeys.all,
        (items = []) => items.filter((item) => item.id !== id))
      await client.invalidateQueries({ queryKey: notificationKeys.unread })
    },
  })
}
