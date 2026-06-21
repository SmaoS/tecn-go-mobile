import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../../components/UI'
import { PrivateImage } from '../../../components/PrivateImage'
import type { TechnicianProfile } from '../../../types'

export function TechnicianMenu({ visible, profile, onClose, onNavigate, onSwitchMode, onLogout }: {
  visible: boolean
  profile?: TechnicianProfile
  onClose: () => void
  onNavigate: (screen: 'TechnicianProfile' | 'TechnicianHome' | 'TechnicianReferrals' | 'Legal') => void
  onSwitchMode?: () => void
  onLogout: () => void
}) {
  function go(screen: 'TechnicianProfile' | 'TechnicianHome' | 'TechnicianReferrals' | 'Legal') {
    onClose()
    onNavigate(screen)
  }
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <SafeAreaView edges={['top', 'bottom', 'left']} style={styles.drawer}>
        <Pressable onPress={() => go('TechnicianProfile')} style={styles.profile}>
          {profile?.profilePhotoUrl
            ? <PrivateImage url={profile.profilePhotoUrl} style={styles.avatar} />
            : <View style={[styles.avatar, styles.fallback]}><Text style={styles.initial}>{profile?.fullName?.charAt(0) ?? 'T'}</Text></View>}
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile?.fullName ?? 'Técnico TecnGo'}</Text>
            <Text style={styles.reputation}>★ {(profile?.averageRating ?? 5).toFixed(1)} · {profile?.completedServicesCount ?? 0} servicios</Text>
          </View>
        </Pressable>
        <View style={styles.menu}>
          <MenuItem label="Servicios Asignados" onPress={() => go('TechnicianHome')} />
          <MenuItem label="Invita y gana" onPress={() => go('TechnicianReferrals')} />
          <MenuItem label="Compromisos y términos" onPress={() => go('Legal')} />
        </View>
        <View style={styles.logout}>
          {onSwitchMode && <MenuItem label="Modo cliente" onPress={() => { onClose(); onSwitchMode() }} />}
          <MenuItem label="Cerrar sesión" danger onPress={() => { onClose(); onLogout() }} />
        </View>
      </SafeAreaView>
      <Pressable style={styles.dismiss} onPress={onClose} />
    </View>
  </Modal>
}

function MenuItem({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable onPress={onPress} style={styles.item}><Text style={[styles.itemText, danger && styles.danger]}>{label}</Text></Pressable>
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
  reputation: { color: colors.brand, fontSize: 12, fontWeight: '700', marginTop: 5 },
  item: { paddingHorizontal: 22, paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  itemText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  danger: { color: '#be123c' },
})
