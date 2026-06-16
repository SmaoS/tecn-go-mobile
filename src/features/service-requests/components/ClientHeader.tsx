import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function ClientHeader({ unread = 0, onMenu, onNotifications }: {
  unread?: number
  onMenu: () => void
  onNotifications: () => void
}) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Abrir menú" onPress={onMenu} style={styles.iconButton}>
        <Text style={styles.icon}>☰</Text>
      </Pressable>
      <View>
        <Text style={styles.brand}>TecnGo</Text>
        <Text style={styles.caption}>Servicios técnicos</Text>
      </View>
      <Pressable accessibilityLabel="Notificaciones" onPress={onNotifications} style={styles.iconButton}>
        <Text style={styles.bell}>🔔</Text>
        {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View>}
      </Pressable>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#fff' },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#0f172a', fontSize: 24, fontWeight: '900' },
  bell: { fontSize: 22 },
  brand: { color: '#0f172a', fontSize: 19, fontWeight: '900', textAlign: 'center' },
  caption: { color: '#0891b2', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 1 },
  badge: { position: 'absolute', top: 4, right: 3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
})
