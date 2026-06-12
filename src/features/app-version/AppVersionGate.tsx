import Constants from 'expo-constants'
import { useEffect, useState, type ReactNode } from 'react'
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { api } from '../../api/client'
import { colors } from '../../components/UI'
import type { AppVersionCheck } from '../../types'

export function AppVersionGate({ children }: { children: ReactNode }) {
  const [check, setCheck] = useState<AppVersionCheck>()
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return
    const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID'
    const currentVersion = Constants.expoConfig?.version ?? '1.0.0'
    api.get<AppVersionCheck>('/v1/app-version/check', { params: { platform, currentVersion } })
      .then(({ data }) => setCheck(data))
      .catch((reason) => console.warn('App version check failed; continuing normally.', reason))
  }, [])
  const visible = Boolean(check?.updateRequired && !dismissed)
  return <>{children}<Modal visible={visible} transparent animationType="fade" onRequestClose={() => {
    if (!check?.forceUpdate) setDismissed(true)
  }}>
    <View style={styles.overlay}><View style={styles.card}><Text style={styles.title}>{check?.forceUpdate ? 'Actualización requerida' : 'Actualización disponible'}</Text>
      <Text style={styles.message}>{check?.message}</Text>
      <Pressable style={styles.primary} onPress={() => check?.updateUrl && void Linking.openURL(check.updateUrl)}><Text style={styles.primaryText}>Actualizar</Text></Pressable>
      {!check?.forceUpdate && <Pressable style={styles.secondary} onPress={() => setDismissed(true)}><Text style={styles.secondaryText}>Continuar</Text></Pressable>}
    </View></View>
  </Modal></>
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.9)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  message: { color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 20 },
  primary: { borderRadius: 14, backgroundColor: colors.brand, padding: 14, alignItems: 'center' },
  primaryText: { color: colors.bg, fontWeight: '800' },
  secondary: { padding: 14, alignItems: 'center' },
  secondaryText: { color: colors.brand, fontWeight: '700' },
})
