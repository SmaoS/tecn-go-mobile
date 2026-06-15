import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

export type TechnicianTab = 'available' | 'earnings'

export function TechnicianFooter({ active, onSelect }: {
  active: TechnicianTab
  onSelect: (tab: TechnicianTab) => void
}) {
  return <SafeAreaView style={styles.safe}>
    <View style={styles.footer}>
      <FooterButton label="Solicitudes disponibles" active={active === 'available'} onPress={() => onSelect('available')} />
      <FooterButton label="Ganancias" active={active === 'earnings'} onPress={() => onSelect('earnings')} />
    </View>
  </SafeAreaView>
}

function FooterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.button, active && styles.active]}>
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
  </Pressable>
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#fff' },
  footer: { minHeight: 66, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#cbd5e1', backgroundColor: '#fff' },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, borderTopWidth: 3, borderTopColor: 'transparent' },
  active: { borderTopColor: '#0891b2', backgroundColor: '#ecfeff' },
  label: { color: '#64748b', fontWeight: '700', textAlign: 'center', fontSize: 12 },
  activeLabel: { color: '#0e7490' },
})
