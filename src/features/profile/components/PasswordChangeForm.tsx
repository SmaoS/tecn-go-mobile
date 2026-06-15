import { useState } from 'react'
import { Text } from 'react-native'
import { Button, styles } from '../../../components/UI'
import { SecureField } from '../../../components/SecureField'
import { apiMessage } from '../../../shared/apiMessage'
import { useChangePassword } from '../hooks'

export function PasswordChangeForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [notice, setNotice] = useState('')
  const change = useChangePassword()
  return <>
    <Text style={styles.label}>Cambiar contraseña</Text>
    <SecureField placeholder="Contraseña actual" value={form.currentPassword} onChangeText={(currentPassword) => setForm({ ...form, currentPassword })} />
    <SecureField placeholder="Nueva contraseña" value={form.newPassword} onChangeText={(newPassword) => setForm({ ...form, newPassword })} />
    <SecureField placeholder="Confirmar nueva contraseña" value={form.confirmPassword} onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })} />
    {form.confirmPassword && form.newPassword !== form.confirmPassword && <Text style={styles.error}>Las contraseñas no coinciden</Text>}
    {(notice || change.error) && <Text style={change.error ? styles.error : styles.muted}>{change.error ? apiMessage(change.error) : notice}</Text>}
    <Button title="Actualizar contraseña" loading={change.isPending} onPress={() => {
      if (form.newPassword !== form.confirmPassword) return
      change.mutate(form, {
        onSuccess: ({ message }) => {
          setNotice(message)
          setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        },
      })
    }} />
  </>
}
