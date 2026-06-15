import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { TechnicianAvailabilitySwitch } from './TechnicianAvailabilitySwitch'

export function TechnicianHeader({ available, loading, onAvailabilityChange, onMenu }: {
  available: boolean
  loading?: boolean
  onAvailabilityChange: (available: boolean) => void
  onMenu: () => void
}) {
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Abrir menú" onPress={onMenu} style={styles.iconButton}>
        <Text style={styles.icon}>☰</Text>
      </Pressable>
      <TechnicianAvailabilitySwitch available={available} loading={loading} onChange={onAvailabilityChange} />
      <View style={[styles.iconButton, styles.disabled]} accessibilityElementsHidden>
        <Text style={styles.icon}>⚙</Text>
      </View>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#fff' },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0 },
  icon: { color: '#0f172a', fontSize: 24, fontWeight: '700' },
})
