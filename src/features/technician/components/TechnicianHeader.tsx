import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../../components/UI'
import { TechnicianAvailabilitySwitch } from './TechnicianAvailabilitySwitch'

export function TechnicianHeader({ available, loading, unread = 0, onAvailabilityChange, onMenu, onNotifications }: {
  available: boolean
  loading?: boolean
  unread?: number
  onAvailabilityChange: (available: boolean) => void
  onMenu: () => void
  onNotifications: () => void
}) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Abrir menú" onPress={onMenu} style={styles.iconButton}>
        <Text style={styles.icon}>☰</Text>
      </Pressable>
      <View style={styles.center}>
        <Image source={require('../../../../assets/isotipo-pin.png')} style={styles.logo} resizeMode="contain" />
        <TechnicianAvailabilitySwitch available={available} loading={loading} onChange={onAvailabilityChange} />
      </View>
      <Pressable accessibilityLabel="Notificaciones" onPress={onNotifications} style={styles.iconButton}>
        <Text style={styles.bell}>🔔</Text>
        {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View>}
      </Pressable>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg },
  header: { minHeight: 68, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  center: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 25, height: 31 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  icon: { color: colors.text, fontSize: 24, fontWeight: '700' },
  bell: { fontSize: 22 },
  badge: { position: 'absolute', top: 4, right: 3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
})
