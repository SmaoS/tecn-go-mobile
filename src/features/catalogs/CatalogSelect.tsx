import { useState } from 'react'
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import type { CatalogItem } from '../../types'

export function CatalogSelect({ label, value, items = [], disabled = false, onChange }: {
  label: string
  value?: string
  items?: CatalogItem[]
  disabled?: boolean
  onChange: (item: CatalogItem) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = items.find((item) => item.id === value)
  return <>
    <Text style={styles.label}>{label}</Text>
    <Pressable disabled={disabled} onPress={() => setOpen(true)} style={[styles.field, disabled && styles.disabled]}>
      <Text style={selected ? styles.value : styles.placeholder}>{selected?.name ?? `Selecciona ${label.toLowerCase()}`}</Text>
      <Text style={styles.arrow}>⌄</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.heading}><Text style={styles.title}>{label}</Text><Pressable onPress={() => setOpen(false)}><Text style={styles.close}>Cerrar</Text></Pressable></View>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Pressable style={styles.option} onPress={() => { onChange(item); setOpen(false) }}><Text style={styles.optionText}>{item.name}</Text></Pressable>}
          />
        </SafeAreaView>
      </View>
    </Modal>
  </>
}

const styles = StyleSheet.create({
  label: { color: '#f8fafc', fontWeight: '700', marginBottom: 7 },
  field: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
  disabled: { opacity: .55 },
  value: { color: '#f8fafc' },
  placeholder: { color: '#94a3b8' },
  arrow: { color: '#22d3ee', fontSize: 20 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,.65)' },
  sheet: { maxHeight: '70%', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
  close: { color: '#0891b2', fontWeight: '800', padding: 8 },
  option: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  optionText: { color: '#1e293b', fontSize: 16, fontWeight: '600' },
})
