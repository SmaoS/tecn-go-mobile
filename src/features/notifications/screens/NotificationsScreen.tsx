import { FlatList, Pressable, Text } from 'react-native'
import { Card, Screen, colors, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { useMarkNotificationRead, useNotifications } from '../hooks'

export function NotificationsScreen() {
  const items = useNotifications()
  const read = useMarkNotificationRead()
  return <Screen><Text style={styles.title}>Notificaciones</Text><QueryState pending={items.isPending} error={items.error} empty={items.data?.length === 0} emptyText="No tienes notificaciones.">
    <FlatList data={items.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => read.mutate(item)}><Card><Text style={[styles.cardTitle, item.read && { color: colors.muted }]}>{item.title}{item.read ? '' : ' · Nueva'}</Text><Text style={styles.muted}>{item.message}</Text><Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text></Card></Pressable>} />
  </QueryState></Screen>
}
