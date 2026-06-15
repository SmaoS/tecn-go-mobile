import { useState } from 'react'
import { Text } from 'react-native'
import { Button, Card, Field, styles, colors } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { Session, UserProfile } from '../../../types'
import { useProfile, useSaveProfile, useVerifyEmail } from '../hooks'
import { useDocumentUpload, useProfileImageUpload } from '../../files/hooks'
import { useCurrentLocation } from '../../location/hooks'
import { PasswordChangeForm } from '../components/PasswordChangeForm'
import { useDoubleBackExit } from '../../../hooks/useDoubleBackExit'

export function ProfileScreen({ session, onLogout, navigation, rootExit = false }: { session: Session; onLogout: () => void; navigation?: { navigate: (screen: 'CaptureProfilePhoto' | 'Legal') => void }; rootExit?: boolean }) {
  useDoubleBackExit(rootExit)
  const profile = useProfile()
  const save = useSaveProfile()
  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [notice, setNotice] = useState('')
  const location = useCurrentLocation()
  const profileImage = useProfileImageUpload()
  const document = useDocumentUpload()
  const verifyEmail = useVerifyEmail()
  const current = draft ?? profile.data
  function update(value: Partial<UserProfile>) {
    if (current) setDraft({ ...current, ...value })
  }
  async function useHomeGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) update({ homeLatitude: coordinates.latitude, homeLongitude: coordinates.longitude })
  }
  function submit() {
    if (!current?.documentPhotoUrl) { setNotice('El documento es obligatorio'); return }
    save.mutate(current, {
      onSuccess: () => { setDraft(null); setNotice('Perfil actualizado.') },
    })
  }
  const verificationLabel = current?.verificationStatus === 'VERIFIED'
    ? 'Identidad verificada'
    : current?.verificationStatus === 'PENDING_VERIFICATION'
      ? 'Documento pendiente de verificación'
      : 'Carga tu documento para iniciar la verificación'
  return <KeyboardAwareScreen><Text style={styles.title}>Mi perfil</Text><QueryState pending={profile.isPending} error={profile.error}>
    {current && <><Card><Text style={[styles.muted, { color: colors.brand }]}>{verificationLabel}</Text><Text style={styles.muted}>Correo: {current.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {current.documentsVerified ? 'verificados' : 'pendientes'}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {current.averageRating.toFixed(1)} · {current.paidServicesCount} servicios pagados</Text></Card>
      <Field value={session.email} editable={false} selectTextOnFocus={false} accessibilityLabel="Correo registrado" />
      <Field placeholder="Nombre completo" value={current.fullName} onChangeText={(fullName) => update({ fullName })} />
      <Field placeholder="Teléfono" value={current.phone ?? ''} onChangeText={(phone) => update({ phone })} />
      <Field placeholder="Dirección domicilio" value={current.homeAddress ?? ''} onChangeText={(homeAddress) => update({ homeAddress })} />
      <Field placeholder="Ciudad" value={current.homeCity ?? ''} onChangeText={(homeCity) => update({ homeCity })} />
      <Field placeholder="Barrio" value={current.homeNeighborhood ?? ''} onChangeText={(homeNeighborhood) => update({ homeNeighborhood })} />
      <Button title={current.homeLatitude != null && current.homeLongitude != null ? 'Ubicación de domicilio lista' : 'Obtener ubicación del domicilio'} onPress={useHomeGps} loading={location.isLocating} />
      <Button title={current.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={() => profileImage.mutate(undefined, { onSuccess: (url) => update({ profilePhotoUrl: url ?? current.profilePhotoUrl }) })} loading={profileImage.isPending} />
      {navigation && <Button title="Tomar foto de perfil con cámara" onPress={() => navigation.navigate('CaptureProfilePhoto')} />}
      <Button title={current.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={() => document.mutate('DOCUMENT', { onSuccess: (url) => update({ documentPhotoUrl: url ?? current.documentPhotoUrl }) })} loading={document.isPending} />
      {(notice || location.error || save.error || profileImage.error || document.error) && <Text style={(save.error || profileImage.error || document.error) ? styles.error : styles.muted}>{save.error || profileImage.error || document.error ? apiMessage(save.error ?? profileImage.error ?? document.error) : location.error || notice}</Text>}
      <Button title="Guardar perfil" onPress={submit} loading={save.isPending} />
      {navigation && <Button title="Seguridad, términos y datos" onPress={() => navigation.navigate('Legal')} />}
      {!current.emailVerified && <Button title="Verificar correo" loading={verifyEmail.isPending} onPress={() => verifyEmail.mutate(undefined, { onSuccess: () => setNotice('Correo de verificación enviado'), onError: (error) => setNotice(apiMessage(error)) })} />}</>}
  </QueryState><PasswordChangeForm /><Button title="Cerrar sesión" onPress={onLogout} /></KeyboardAwareScreen>
}
