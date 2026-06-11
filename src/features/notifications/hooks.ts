import { useQuery } from '@tanstack/react-query'
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
