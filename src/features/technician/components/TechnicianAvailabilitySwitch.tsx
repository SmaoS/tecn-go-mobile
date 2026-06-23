import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../components/UI'

export function TechnicianAvailabilitySwitch({ available, loading, onChange }: {
  available: boolean
  loading?: boolean
  onChange: (available: boolean) => void
}) {
  return <View style={styles.container}>
    <Pressable disabled={loading} onPress={() => onChange(false)} style={[styles.option, !available && styles.busy]}>
      <Text style={[styles.text, !available && styles.activeText]}>Ocupado</Text>
    </Pressable>
    <Pressable disabled={loading} onPress={() => onChange(true)} style={[styles.option, available && styles.available]}>
      {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={[styles.text, available && styles.activeText]}>Disponible</Text>}
    </Pressable>
  </View>
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 20, backgroundColor: '#e5e7eb', padding: 3 },
  option: { minWidth: 78, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 17, alignItems: 'center' },
  busy: { backgroundColor: '#fa3a3a' },
  available: { backgroundColor: colors.brandDark },
  text: { color: '#475569', fontSize: 12, fontWeight: '800' },
  activeText: { color: '#fff' },
})
