import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, colors, styles } from '../../../components/UI'
import { SecureField } from '../../../components/SecureField'
import { apiMessage } from '../../../shared/apiMessage'
import { useChangePassword } from '../hooks'
import { showToast } from '../../../components/Toast'

export function PasswordChangeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const change = useChangePassword()

  useEffect(() => {
    if (!visible) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      change.reset()
    }
  }, [visible])

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={modalStyles.overlay}>
      <SafeAreaView style={modalStyles.card}>
        <View style={modalStyles.heading}>
          <Text style={modalStyles.title}>Modificar contraseña</Text>
          <Pressable onPress={onClose}><Text style={modalStyles.close}>Cerrar</Text></Pressable>
        </View>
        <Text style={modalStyles.label}>Contraseña actual</Text>
        <SecureField value={form.currentPassword} onChangeText={(currentPassword) => setForm({ ...form, currentPassword })} />
        <Text style={modalStyles.label}>Nueva contraseña</Text>
        <SecureField value={form.newPassword} onChangeText={(newPassword) => setForm({ ...form, newPassword })} />
        <Text style={modalStyles.label}>Confirmar nueva contraseña</Text>
        <SecureField value={form.confirmPassword} onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })} />
        {form.confirmPassword && form.newPassword !== form.confirmPassword && <Text style={styles.error}>Las contraseñas no coinciden</Text>}
        {change.error && <Text style={styles.error}>{apiMessage(change.error)}</Text>}
        <Button title="Actualizar contraseña" loading={change.isPending} onPress={() => {
          if (form.newPassword !== form.confirmPassword) return
          change.mutate(form, {
            onSuccess: ({ message }) => {
              showToast(message)
              setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
              onClose()
            },
          })
        }} />
      </SafeAreaView>
    </View>
  </Modal>
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,.65)' },
  card: { backgroundColor: colors.bg, padding: 20, paddingBottom: 28, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  close: { color: colors.brand, fontWeight: '800', padding: 8 },
  label: { color: colors.text, fontWeight: '700', marginBottom: 7 },
})
