import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { Pressable, Text } from 'react-native'
import { Button, Card, Field, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { pickAndUploadEvidence, pickAndUploadImage } from '../../../services/files'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import { technicianApi } from '../api'
import { technicianProfileKey, useTechnicianCategories, useTechnicianProfile } from '../hooks'
import type { TechnicianProfileForm } from '../types'

const empty: TechnicianProfileForm = {
  documentNumber: '', phone: '', categoryIds: [], description: '', profilePhotoUrl: '',
  documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '',
  latitude: '', longitude: '', homeAddress: '', homeLatitude: '', homeLongitude: '',
  homeCity: '', homeNeighborhood: '',
}

export function TechnicianProfileScreen() {
  const client = useQueryClient()
  const profile = useTechnicianProfile()
  const categories = useTechnicianCategories()
  const [form, setForm] = useState(empty)
  const [locationError, setLocationError] = useState('')
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
  const save = useMutation({
    mutationFn: () => technicianApi.saveProfile(Boolean(profile.data), {
      ...form, latitude: Number(form.latitude), longitude: Number(form.longitude),
      homeLatitude: Number(form.homeLatitude), homeLongitude: Number(form.homeLongitude),
    }),
    onSuccess: (data) => client.setQueryData(technicianProfileKey, data),
  })
  async function useGps() {
    setLocationError('')
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted) { setLocationError('Debes permitir el acceso a la ubicación'); return }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    setForm({
      ...form, latitude: String(location.coords.latitude), longitude: String(location.coords.longitude),
      homeLatitude: String(location.coords.latitude), homeLongitude: String(location.coords.longitude),
    })
  }
  const profileError = profile.error && (!axios.isAxiosError(profile.error) || profile.error.response?.status !== 404)
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
        <Button title={form.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={async () => setForm({ ...form, profilePhotoUrl: await pickAndUploadImage() ?? form.profilePhotoUrl })} />
        <Button title={form.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={async () => setForm({ ...form, documentPhotoUrl: await pickAndUploadEvidence() ?? form.documentPhotoUrl })} />
        <Button title={form.certificatePhotoUrl ? 'Certificado cargado' : 'Subir certificado opcional'} onPress={async () => setForm({ ...form, certificatePhotoUrl: await pickAndUploadEvidence('CERTIFICATE') ?? form.certificatePhotoUrl })} />
        <Field placeholder="Dirección domicilio" value={form.homeAddress} onChangeText={(homeAddress) => setForm({ ...form, homeAddress })} />
        <Field placeholder="Ciudad" value={form.homeCity} onChangeText={(homeCity) => setForm({ ...form, homeCity })} />
        <Field placeholder="Barrio" value={form.homeNeighborhood} onChangeText={(homeNeighborhood) => setForm({ ...form, homeNeighborhood })} />
        <Field keyboardType="numeric" placeholder="Latitud domicilio" value={form.homeLatitude} onChangeText={(homeLatitude) => setForm({ ...form, homeLatitude })} />
        <Field keyboardType="numeric" placeholder="Longitud domicilio" value={form.homeLongitude} onChangeText={(homeLongitude) => setForm({ ...form, homeLongitude })} />
        <Field keyboardType="numeric" placeholder="Latitud" value={form.latitude} onChangeText={(latitude) => setForm({ ...form, latitude })} />
        <Field keyboardType="numeric" placeholder="Longitud" value={form.longitude} onChangeText={(longitude) => setForm({ ...form, longitude })} />
        <Button title="Usar mi ubicación GPS" onPress={useGps} />
        {(locationError || save.error) && <Text style={styles.error}>{locationError || apiMessage(save.error)}</Text>}
        <Button title={profile.data ? 'Actualizar perfil' : 'Crear perfil'} onPress={() => save.mutate()} loading={save.isPending} /></>
    </QueryState>
  </KeyboardAwareScreen>
}
