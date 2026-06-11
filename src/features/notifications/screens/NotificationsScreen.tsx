import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FlatList, Pressable, Text } from 'react-native'
import { Card, Screen, colors, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import type { UserNotification } from '../../../types'
import { notificationsApi } from '../api'
import { notificationKeys, useNotifications } from '../hooks'

export function NotificationsScreen() {
  const client = useQueryClient()
  const items = useNotifications()
  const read = useMutation({
    mutationFn: async (item: UserNotification) => { if (!item.read) await notificationsApi.read(item.id) },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.all }),
        client.invalidateQueries({ queryKey: notificationKeys.unread }),
      ])
    },
  })
  return <Screen><Text style={styles.title}>Notificaciones</Text><QueryState pending={items.isPending} error={items.error} empty={items.data?.length === 0} emptyText="No tienes notificaciones.">
    <FlatList data={items.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => read.mutate(item)}><Card><Text style={[styles.cardTitle, item.read && { color: colors.muted }]}>{item.title}{item.read ? '' : ' · Nueva'}</Text><Text style={styles.muted}>{item.message}</Text><Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text></Card></Pressable>} />
  </QueryState></Screen>
}
