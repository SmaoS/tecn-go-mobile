import * as Location from 'expo-location'
import { useState } from 'react'
import { Text } from 'react-native'
import { Button, Card, Field, styles, colors } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { pickAndUploadEvidence, pickAndUploadImage } from '../../../services/files'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { Session, UserProfile } from '../../../types'
import { profileApi } from '../api'
import { useProfile, useSaveProfile } from '../hooks'

export function ProfileScreen({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const profile = useProfile()
  const save = useSaveProfile()
  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [notice, setNotice] = useState('')
  const current = draft ?? profile.data
  function update(value: Partial<UserProfile>) {
    if (current) setDraft({ ...current, ...value })
  }
  async function useHomeGps() {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted) { setNotice('Permiso de ubicación denegado'); return }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    update({ homeLatitude: location.coords.latitude, homeLongitude: location.coords.longitude })
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
    {current && <><Card><Text style={styles.cardTitle}>{session.email}</Text><Text style={[styles.muted, { color: colors.brand }]}>{verificationLabel}</Text><Text style={styles.muted}>Correo: {current.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {current.documentsVerified ? 'verificados' : 'pendientes'}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {current.averageRating.toFixed(1)} · {current.paidServicesCount} servicios pagados</Text></Card>
      <Field placeholder="Nombre completo" value={current.fullName} onChangeText={(fullName) => update({ fullName })} />
      <Field placeholder="Teléfono" value={current.phone ?? ''} onChangeText={(phone) => update({ phone })} />
      <Field placeholder="Dirección domicilio" value={current.homeAddress ?? ''} onChangeText={(homeAddress) => update({ homeAddress })} />
      <Field placeholder="Ciudad" value={current.homeCity ?? ''} onChangeText={(homeCity) => update({ homeCity })} />
      <Field placeholder="Barrio" value={current.homeNeighborhood ?? ''} onChangeText={(homeNeighborhood) => update({ homeNeighborhood })} />
      <Field keyboardType="numeric" placeholder="Latitud domicilio" value={String(current.homeLatitude ?? '')} onChangeText={(value) => update({ homeLatitude: Number(value) })} />
      <Field keyboardType="numeric" placeholder="Longitud domicilio" value={String(current.homeLongitude ?? '')} onChangeText={(value) => update({ homeLongitude: Number(value) })} />
      <Button title="Usar ubicación actual" onPress={useHomeGps} />
      <Button title={current.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={async () => update({ profilePhotoUrl: await pickAndUploadImage() ?? current.profilePhotoUrl })} />
      <Button title={current.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={async () => update({ documentPhotoUrl: await pickAndUploadEvidence() ?? current.documentPhotoUrl })} />
      {(notice || save.error) && <Text style={save.error ? styles.error : styles.muted}>{save.error ? apiMessage(save.error) : notice}</Text>}
      <Button title="Guardar perfil" onPress={submit} loading={save.isPending} />
      {!current.emailVerified && <Button title="Verificar correo" onPress={() => profileApi.verifyEmail().then(() => setNotice('Correo de verificación enviado')).catch((error) => setNotice(apiMessage(error)))} />}</>}
  </QueryState><Button title="Cerrar sesión" onPress={onLogout} /></KeyboardAwareScreen>
}
