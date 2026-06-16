import { FlatList, Pressable, Text, View } from 'react-native'
import { Card, Screen, colors, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { useDeleteNotification, useMarkNotificationRead, useNotifications } from '../hooks'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { navigationRef } from '../../../navigation/navigationRef'
import { openNotification } from '../../../navigation/notificationNavigation'

export function NotificationsScreen(_: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
  const items = useNotifications()
  const read = useMarkNotificationRead()
  const remove = useDeleteNotification()
  const { session } = useSession()
  function select(item: NonNullable<typeof items.data>[number]) {
    read.mutate(item, {
      onSettled: () => {
        if (session) openNotification(navigationRef, session.role, item)
      },
    })
  }
  return <Screen><Text style={styles.title}>Notificaciones</Text><QueryState pending={items.isPending} error={items.error} empty={items.data?.length === 0} emptyText="No tienes notificaciones.">
    <FlatList data={items.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <Pressable onPress={() => select(item)} style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, item.read && { color: colors.muted }]}>{item.title}{item.read ? '' : ' · Nueva'}</Text>
          <Text style={styles.muted}>{item.message}</Text>
          <Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Eliminar notificación"
          onPress={() => remove.mutate(item.id)}
          style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}
        >
          <Text style={{ color: colors.muted, fontWeight: '800' }}>×</Text>
        </Pressable>
      </View>
    </Card>} />
  </QueryState></Screen>
}
