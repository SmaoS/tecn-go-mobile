import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../components/UI'
import type { AppVersionCheck } from '../../types'
import { checkAppVersion, getCurrentAppVersion, openStore } from './VersionCheckService'

export async function checkAppVersionBeforeLogin() {
  return checkAppVersion()
}

export function AppVersionModal({
  check,
  onContinue,
  continueLabel = 'Más tarde',
}: {
  check?: AppVersionCheck
  onContinue: () => void
  continueLabel?: string
}) {
  const currentVersion = getCurrentAppVersion()
  return <Modal visible={Boolean(check)} transparent animationType="fade" onRequestClose={() => {
    if (!check?.forceUpdate) onContinue()
  }}>
    <View style={styles.overlay}><View style={styles.card}><Text style={styles.title}>{check?.forceUpdate ? 'Actualización requerida' : 'Actualización disponible'}</Text>
      <Text style={styles.message}>{check?.message}</Text>
      <Text style={styles.detail}>Instalada: {currentVersion} · mínima: {check?.minimumSupportedVersion}</Text>
      <Pressable style={styles.primary} onPress={() => void openStore(check)}><Text style={styles.primaryText}>Actualizar</Text></Pressable>
      {!check?.forceUpdate && <Pressable style={styles.secondary} onPress={onContinue}><Text style={styles.secondaryText}>{continueLabel}</Text></Pressable>}
    </View></View>
  </Modal>
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.9)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  message: { color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 20 },
  detail: { color: colors.muted, fontSize: 13, marginBottom: 16 },
  primary: { borderRadius: 14, backgroundColor: colors.brand, padding: 14, alignItems: 'center' },
  primaryText: { color: colors.bg, fontWeight: '800' },
  secondary: { padding: 14, alignItems: 'center' },
  secondaryText: { color: colors.brand, fontWeight: '700' },
})
