import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { PrivateImage } from '../../../components/PrivateImage'
import type { TechnicianProfile } from '../../../types'

export function TechnicianMenu({ visible, profile, onClose, onNavigate, onLogout }: {
  visible: boolean
  profile?: TechnicianProfile
  onClose: () => void
  onNavigate: (screen: 'TechnicianProfile' | 'TechnicianHome' | 'TechnicianReferrals' | 'Legal') => void
  onLogout: () => void
}) {
  function go(screen: 'TechnicianProfile' | 'TechnicianHome' | 'TechnicianReferrals' | 'Legal') {
    onClose()
    onNavigate(screen)
  }
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <SafeAreaView style={styles.drawer}>
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
        <MenuItem label="Cerrar sesión" danger onPress={() => { onClose(); onLogout() }} />
      </SafeAreaView>
      <Pressable style={styles.dismiss} onPress={onClose} />
    </View>
  </Modal>
}

function MenuItem({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable onPress={onPress} style={styles.item}><Text style={[styles.itemText, danger && styles.danger]}>{label}</Text></Pressable>
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(15,23,42,.45)' },
  drawer: { width: '82%', maxWidth: 340, backgroundColor: '#fff', paddingTop: 16 },
  menu: { flex: 1 },
  dismiss: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  fallback: { backgroundColor: '#cffafe', alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#0e7490', fontSize: 24, fontWeight: '900' },
  profileText: { flex: 1, marginLeft: 14 },
  name: { color: '#0f172a', fontSize: 18, fontWeight: '900' },
  reputation: { color: '#0891b2', fontSize: 12, fontWeight: '700', marginTop: 5 },
  item: { paddingHorizontal: 22, paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  itemText: { color: '#1e293b', fontSize: 16, fontWeight: '700' },
  danger: { color: '#be123c' },
})
