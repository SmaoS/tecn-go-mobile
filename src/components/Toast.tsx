import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from './UI'

type ToastKind = 'success' | 'error' | 'info'
type ToastMessage = { id: number; message: string; kind: ToastKind }
type Listener = (toast: ToastMessage) => void

const listeners = new Set<Listener>()
let nextId = 1

export function showToast(message: string, kind: ToastKind = 'success') {
  const toast = { id: nextId++, message, kind }
  listeners.forEach((listener) => listener(toast))
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastMessage>()
  useEffect(() => {
    const listener: Listener = (next) => setToast(next)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])
  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(undefined), 3200)
    return () => clearTimeout(timeout)
  }, [toast])
  if (!toast) return null
  return <SafeAreaView pointerEvents="none" edges={['top']} style={styles.host}>
    <View style={[styles.toast, toast.kind === 'error' && styles.error, toast.kind === 'info' && styles.info]}>
      <Text style={styles.text}>{toast.message}</Text>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 14, right: 14, top: 0, zIndex: 10000 },
  toast: { alignSelf: 'center', maxWidth: 520, width: '100%', backgroundColor: '#065F2D', borderColor: colors.brand, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13 },
  error: { backgroundColor: '#7F1D1D', borderColor: colors.danger },
  info: { backgroundColor: '#172554', borderColor: '#60A5FA' },
  text: { color: colors.text, fontWeight: '800', textAlign: 'center' },
})
