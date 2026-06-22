import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../../components/UI'

export function ClientHeader({ unread = 0, onMenu, onNotifications }: {
  unread?: number
  onMenu: () => void
  onNotifications: () => void
}) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
    <View style={styles.header}>
      <Pressable testID="e2e.client.menu" accessibilityLabel="Abrir menú" onPress={onMenu} style={styles.iconButton}>
        <Text style={styles.icon}>☰</Text>
      </Pressable>
      <Image source={require('../../../../assets/logo-horizontal-dark.png')} style={styles.logo} resizeMode="contain" />
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
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  icon: { color: colors.text, fontSize: 24, fontWeight: '900' },
  bell: { fontSize: 22 },
  logo: { width: 126, height: 44 },
  badge: { position: 'absolute', top: 4, right: 3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
})
