import type { ReactNode } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export const colors = { bg: '#020617', card: '#0f172a', border: '#1e293b', text: '#f8fafc', muted: '#94a3b8', brand: '#22d3ee', dark: '#083344', danger: '#fb7185' }

export function Screen({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.screen}><View style={styles.container}>{children}</View></SafeAreaView>
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} style={styles.field} {...props} />
}

export function Button({ title, onPress, loading }: { title: string; onPress: () => void; loading?: boolean }) {
  return <Pressable disabled={loading} onPress={onPress} style={styles.button}>{loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.buttonText}>{title}</Text>}</Pressable>
}

export function LoadingOverlay({ visible, text = 'Procesando...' }: { visible: boolean; text?: string }) {
  return <Modal transparent visible={visible} animationType="fade"><View style={styles.overlay}><View style={styles.loadingCard}><ActivityIndicator size="large" color={colors.brand} /><Text style={{ color: colors.text, marginTop: 12, fontWeight: '700' }}>{text}</Text></View></View></Modal>
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 20 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 16, marginBottom: 24 },
  label: { color: colors.text, fontWeight: '700', marginBottom: 8 },
  field: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, color: colors.text, padding: 14, marginBottom: 12 },
  button: { backgroundColor: colors.brand, borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 },
  buttonText: { color: colors.bg, fontWeight: '800', fontSize: 16 },
  link: { color: colors.brand, textAlign: 'center', padding: 14 },
  error: { color: colors.danger, marginBottom: 10 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  muted: { color: colors.muted, marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.75)', justifyContent: 'center', alignItems: 'center' },
  loadingCard: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 28, alignItems: 'center' },
})
