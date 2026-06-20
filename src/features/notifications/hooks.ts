import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from './api'
import { useSmartPolling } from '../../hooks/useSmartPolling'

export const notificationKeys = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread-count'] as const,
}

export function useNotifications() {
  const polling = useSmartPolling()
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: notificationsApi.all,
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
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.all }),
        client.invalidateQueries({ queryKey: notificationKeys.unread }),
      ])
    },
  })
}

export function useDeleteNotification() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.all }),
        client.invalidateQueries({ queryKey: notificationKeys.unread }),
      ])
    },
  })
}
