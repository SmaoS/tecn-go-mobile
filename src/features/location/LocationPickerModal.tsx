import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, colors } from '../../components/UI'
import type { Coordinates } from './hooks'

interface Props {
  visible: boolean
  value?: Coordinates | null
  onSelect: (coordinates: Coordinates) => void
  onClose: () => void
}

export function LocationPickerModal({ visible, onClose }: Props) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={pickerStyles.safe}>
      <View style={pickerStyles.header}>
        <Text style={pickerStyles.title}>Ubicación del servicio</Text>
        <Pressable onPress={onClose} style={pickerStyles.close}><Text style={pickerStyles.closeText}>×</Text></Pressable>
      </View>
      <View style={pickerStyles.placeholder}>
        <Text style={pickerStyles.subtitle}>El selector en mapa está disponible en Android y iOS.</Text>
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </SafeAreaView>
  </Modal>
}

const pickerStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', padding: 18 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.muted, lineHeight: 20, marginBottom: 12, textAlign: 'center' },
  close: { alignItems: 'center', borderColor: colors.border, borderRadius: 999, borderWidth: 1, height: 34, justifyContent: 'center', width: 34 },
  closeText: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 24 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
})
