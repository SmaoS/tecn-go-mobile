import { useEffect, useState } from 'react'
import { Pressable, Text } from 'react-native'
import { Button, Card, Field, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage, hasApiStatus } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import { useSaveTechnicianProfile, useTechnicianCategories, useTechnicianProfile } from '../hooks'
import type { TechnicianProfileForm } from '../types'
import { useDocumentUpload, useProfileImageUpload } from '../../files/hooks'
import { useCurrentLocation } from '../../location/hooks'

const empty: TechnicianProfileForm = {
  documentNumber: '', phone: '', categoryIds: [], description: '', profilePhotoUrl: '',
  documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '',
  latitude: '', longitude: '', homeAddress: '', homeLatitude: '', homeLongitude: '',
  homeCity: '', homeNeighborhood: '',
}

export function TechnicianProfileScreen() {
  const profile = useTechnicianProfile()
  const categories = useTechnicianCategories()
  const [form, setForm] = useState(empty)
  const location = useCurrentLocation()
  const profileImage = useProfileImageUpload()
  const document = useDocumentUpload()
  useEffect(() => {
    if (!profile.data) return
    const data = profile.data
    setForm({
      documentNumber: data.documentNumber, phone: data.phone,
      categoryIds: data.categories.map((item) => item.id), description: data.description,
      profilePhotoUrl: data.profilePhotoUrl ?? '', documentPhotoUrl: data.documentPhotoUrl,
      certificatePhotoUrl: data.certificatePhotoUrl ?? '', workExperienceDescription: data.workExperienceDescription,
      latitude: String(data.latitude ?? ''), longitude: String(data.longitude ?? ''),
      homeAddress: data.homeAddress ?? '', homeLatitude: String(data.homeLatitude ?? ''),
      homeLongitude: String(data.homeLongitude ?? ''), homeCity: data.homeCity ?? '',
      homeNeighborhood: data.homeNeighborhood ?? '',
    })
  }, [profile.data])
  const save = useSaveTechnicianProfile(Boolean(profile.data))
  async function useGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) setForm({
      ...form, latitude: String(coordinates.latitude), longitude: String(coordinates.longitude),
      homeLatitude: String(coordinates.latitude), homeLongitude: String(coordinates.longitude),
    })
  }
  const profileError = profile.error && !hasApiStatus(profile.error, 404)
    ? profile.error : null
  const identityStatus = profile.data?.verificationStatus === 'VERIFIED'
    ? 'Identidad verificada'
    : profile.data?.verificationStatus === 'PENDING_VERIFICATION'
      ? 'Documento pendiente de verificación'
      : 'Completa el documento para iniciar la verificación'
  return <KeyboardAwareScreen><Text style={styles.title}>Perfil técnico</Text><Text style={styles.subtitle}>{profile.data ? `Estado profesional: ${profile.data.status} · ${identityStatus}` : 'Completa tus datos para solicitar aprobación.'}</Text>
    <QueryState pending={profile.isPending || categories.isPending} error={profileError ?? categories.error}>
      <><Field placeholder="Documento" value={form.documentNumber} onChangeText={(documentNumber) => setForm({ ...form, documentNumber })} />
        <Field placeholder="Teléfono" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
        <Text style={styles.label}>Categorías</Text>{categories.data?.map((category) => <Pressable key={category.id} onPress={() => setForm({ ...form, categoryIds: form.categoryIds.includes(category.id) ? form.categoryIds.filter((id) => id !== category.id) : [...form.categoryIds, category.id] })}><Card><Text style={[styles.cardTitle, form.categoryIds.includes(category.id) && { color: colors.brand }]}>{form.categoryIds.includes(category.id) ? '✓ ' : ''}{category.name}</Text></Card></Pressable>)}
        <Field multiline placeholder="Descripción profesional" value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
        <Field multiline placeholder="Experiencia laboral" value={form.workExperienceDescription} onChangeText={(workExperienceDescription) => setForm({ ...form, workExperienceDescription })} />
        <Button title={form.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={() => profileImage.mutate(undefined, { onSuccess: (url) => setForm({ ...form, profilePhotoUrl: url ?? form.profilePhotoUrl }) })} loading={profileImage.isPending} />
        <Button title={form.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={() => document.mutate('DOCUMENT', { onSuccess: (url) => setForm({ ...form, documentPhotoUrl: url ?? form.documentPhotoUrl }) })} loading={document.isPending} />
        <Button title={form.certificatePhotoUrl ? 'Certificado cargado' : 'Subir certificado opcional'} onPress={() => document.mutate('CERTIFICATE', { onSuccess: (url) => setForm({ ...form, certificatePhotoUrl: url ?? form.certificatePhotoUrl }) })} loading={document.isPending} />
        <Field placeholder="Dirección domicilio" value={form.homeAddress} onChangeText={(homeAddress) => setForm({ ...form, homeAddress })} />
        <Field placeholder="Ciudad" value={form.homeCity} onChangeText={(homeCity) => setForm({ ...form, homeCity })} />
        <Field placeholder="Barrio" value={form.homeNeighborhood} onChangeText={(homeNeighborhood) => setForm({ ...form, homeNeighborhood })} />
        <Field keyboardType="numeric" placeholder="Latitud domicilio" value={form.homeLatitude} onChangeText={(homeLatitude) => setForm({ ...form, homeLatitude })} />
        <Field keyboardType="numeric" placeholder="Longitud domicilio" value={form.homeLongitude} onChangeText={(homeLongitude) => setForm({ ...form, homeLongitude })} />
        <Field keyboardType="numeric" placeholder="Latitud" value={form.latitude} onChangeText={(latitude) => setForm({ ...form, latitude })} />
        <Field keyboardType="numeric" placeholder="Longitud" value={form.longitude} onChangeText={(longitude) => setForm({ ...form, longitude })} />
        <Button title="Usar mi ubicación GPS" onPress={useGps} loading={location.isLocating} />
        {(location.error || profileImage.error || document.error || save.error) && <Text style={styles.error}>{location.error || apiMessage(profileImage.error ?? document.error ?? save.error)}</Text>}
        <Button title={profile.data ? 'Actualizar perfil' : 'Crear perfil'} onPress={() => save.mutate(form)} loading={save.isPending} /></>
    </QueryState>
  </KeyboardAwareScreen>
}
