import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from './api'

export const notificationKeys = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread-count'] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: notificationsApi.all,
    refetchInterval: 10_000,
  })
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationsApi.unread,
    refetchInterval: 10_000,
  })
}

export function useMarkNotificationRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (item: { id: string; read: boolean }) => {
      if (!item.read) await notificationsApi.read(item.id)
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.all }),
        client.invalidateQueries({ queryKey: notificationKeys.unread }),
      ])
    },
  })
}
