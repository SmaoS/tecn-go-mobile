import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../../components/UI'
import { PrivateImage } from '../../../components/PrivateImage'
import type { UserProfile } from '../../../types'

type ClientMenuRoute = 'Profile' | 'ClientPayments' | 'RequestHistory' | 'Legal'

export function ClientMenu({ visible, profile, onClose, onNavigate, onSwitchMode, onLogout }: {
  visible: boolean
  profile?: UserProfile
  onClose: () => void
  onNavigate: (screen: ClientMenuRoute) => void
  onSwitchMode?: () => void
  onLogout: () => void
}) {
  function go(screen: ClientMenuRoute) {
    onClose()
    onNavigate(screen)
  }

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <SafeAreaView edges={['top', 'bottom', 'left']} style={styles.drawer}>
        <Pressable onPress={() => go('Profile')} style={styles.profile}>
          {profile?.profilePhotoUrl
            ? <PrivateImage url={profile.profilePhotoUrl} style={styles.avatar} />
            : <View style={[styles.avatar, styles.fallback]}><Text style={styles.initial}>{profile?.fullName?.charAt(0) ?? 'C'}</Text></View>}
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile?.fullName ?? 'Cliente TecnGo'}</Text>
            <Text style={styles.reputation}>★ {(profile?.averageRating ?? 5).toFixed(1)} · {profile?.paidServicesCount ?? 0} servicios</Text>
          </View>
        </Pressable>
        <View style={styles.menu}>
          <MenuItem label="Pagos" onPress={() => go('ClientPayments')} />
          <MenuItem label="Historial de solicitudes" onPress={() => go('RequestHistory')} />
          <MenuItem label="Seguridad y términos" onPress={() => go('Legal')} />
        </View>
        <View style={styles.logout}>
          {onSwitchMode && <MenuItem label="Modo técnico" onPress={() => { onClose(); onSwitchMode() }} />}
          <MenuItem testID="e2e.logout" label="Cerrar sesión" danger onPress={() => { onClose(); onLogout() }} />
        </View>
      </SafeAreaView>
      <Pressable style={styles.dismiss} onPress={onClose} />
    </View>
  </Modal>
}

function MenuItem({ label, onPress, danger = false, testID }: { label: string; onPress: () => void; danger?: boolean; testID?: string }) {
  return <Pressable testID={testID} onPress={onPress} style={styles.item}><Text style={[styles.itemText, danger && styles.danger]}>{label}</Text></Pressable>
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(2,8,23,.72)' },
  drawer: { width: '82%', maxWidth: 340, backgroundColor: colors.card, paddingTop: 16 },
  menu: { flex: 1 },
  logout: { paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  dismiss: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.brand },
  fallback: { backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.brand, fontSize: 24, fontWeight: '900' },
  profileText: { flex: 1, marginLeft: 14 },
  name: { color: colors.text, fontSize: 18, fontWeight: '900' },
  reputation: { color: colors.brand, fontSize: 12, fontWeight: '800', marginTop: 5 },
  item: { paddingHorizontal: 22, paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  itemText: { color: colors.text, fontSize: 16, fontWeight: '800' },
  danger: { color: '#be123c' },
})
