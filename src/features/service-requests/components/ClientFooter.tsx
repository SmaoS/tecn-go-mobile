import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../../components/UI'

export type ClientTab = 'request' | 'requests'

export function ClientFooter({ active, onSelect }: {
  active: ClientTab
  onSelect: (tab: ClientTab) => void
}) {
  const insets = useSafeAreaInsets()
  return <View style={[styles.safe, { paddingBottom: Math.max(insets.bottom, 12) }]}>
    <View style={styles.footer}>
      <FooterButton label="Solicitar servicio" active={active === 'request'} onPress={() => onSelect('request')} />
      <FooterButton label="Mis solicitudes" active={active === 'requests'} onPress={() => onSelect('requests')} />
    </View>
  </View>
}

function FooterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.button, active && styles.active]}>
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
  </Pressable>
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg },
  footer: { minHeight: 66, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.bg },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, borderTopWidth: 3, borderTopColor: 'transparent' },
  active: { borderTopColor: colors.brand, backgroundColor: colors.dark },
  label: { color: colors.muted, fontWeight: '800', textAlign: 'center', fontSize: 12 },
  activeLabel: { color: colors.brand },
})
