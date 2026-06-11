import { FlatList, Pressable, Text } from 'react-native'
import { Card, Screen, colors, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { useMarkNotificationRead, useNotifications } from '../hooks'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { navigationRef } from '../../../navigation/navigationRef'
import { openNotification } from '../../../navigation/notificationNavigation'

export function NotificationsScreen(_: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
  const items = useNotifications()
  const read = useMarkNotificationRead()
  const { session } = useSession()
  function select(item: NonNullable<typeof items.data>[number]) {
    read.mutate(item, {
      onSettled: () => {
        if (session) openNotification(navigationRef, session.role, item)
      },
    })
  }
  return <Screen><Text style={styles.title}>Notificaciones</Text><QueryState pending={items.isPending} error={items.error} empty={items.data?.length === 0} emptyText="No tienes notificaciones.">
    <FlatList data={items.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => select(item)}><Card><Text style={[styles.cardTitle, item.read && { color: colors.muted }]}>{item.title}{item.read ? '' : ' · Nueva'}</Text><Text style={styles.muted}>{item.message}</Text><Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text></Card></Pressable>} />
  </QueryState></Screen>
}
