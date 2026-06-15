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
import { PasswordChangeModal } from '../../profile/components/PasswordChangeModal'
import { CatalogSelect } from '../../catalogs/CatalogSelect'
import { useCities, useCountries, useDepartments } from '../../catalogs/hooks'

const empty: TechnicianProfileForm = {
  documentNumber: '', phone: '', categoryIds: [], description: '', profilePhotoUrl: '',
  documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '',
  latitude: '', longitude: '', homeAddress: '', homeLatitude: '', homeLongitude: '',
  homeCity: '', homeNeighborhood: '', countryId: '', departmentId: '', cityId: '',
}

export function TechnicianProfileScreen() {
  const profile = useTechnicianProfile()
  const categories = useTechnicianCategories()
  const [form, setForm] = useState(empty)
  const [passwordModal, setPasswordModal] = useState(false)
  const location = useCurrentLocation()
  const profileImage = useProfileImageUpload()
  const document = useDocumentUpload()
  const countries = useCountries()
  const departments = useDepartments(form.countryId)
  const cities = useCities(form.departmentId)
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
      homeNeighborhood: data.homeNeighborhood ?? '', countryId: data.countryId ?? '',
      departmentId: data.departmentId ?? '', cityId: data.cityId ?? '',
    })
  }, [profile.data])
  const save = useSaveTechnicianProfile(Boolean(profile.data))
  async function useGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) setForm((value) => ({
      ...value, latitude: String(coordinates.latitude), longitude: String(coordinates.longitude),
      homeLatitude: String(coordinates.latitude), homeLongitude: String(coordinates.longitude),
    }))
  }
  useEffect(() => {
    if (!profile.isPending && (!form.latitude || !form.longitude)) void useGps()
  }, [profile.isPending])
  const profileError = profile.error && !hasApiStatus(profile.error, 404)
    ? profile.error : null
  const identityStatus = profile.data?.verificationStatus === 'VERIFIED'
    ? 'Identidad verificada'
    : profile.data?.verificationStatus === 'PENDING_VERIFICATION'
      ? 'Documento pendiente de verificación'
      : 'Completa el documento para iniciar la verificación'
  return <KeyboardAwareScreen><Text style={styles.title}>Perfil técnico</Text><Text style={styles.subtitle}>{profile.data ? `Estado profesional: ${profile.data.status} · ${identityStatus}` : 'Completa tus datos para solicitar aprobación.'}</Text>
    <QueryState pending={profile.isPending || categories.isPending} error={profileError ?? categories.error}>
      <>{profile.data?.email && <><Text style={styles.label}>Correo</Text><Field value={profile.data.email} editable={false} selectTextOnFocus={false} accessibilityLabel="Correo registrado" /></>}
        <Text style={styles.label}>Documento</Text>
        <Field placeholder="Documento" value={form.documentNumber} onChangeText={(documentNumber) => setForm({ ...form, documentNumber })} />
        <Text style={styles.label}>Teléfono</Text>
        <Field placeholder="Teléfono" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
        <Text style={styles.label}>Categorías</Text>{categories.data?.map((category) => <Pressable key={category.id} onPress={() => setForm({ ...form, categoryIds: form.categoryIds.includes(category.id) ? form.categoryIds.filter((id) => id !== category.id) : [...form.categoryIds, category.id] })}><Card><Text style={[styles.cardTitle, form.categoryIds.includes(category.id) && { color: colors.brand }]}>{form.categoryIds.includes(category.id) ? '✓ ' : ''}{category.name}</Text></Card></Pressable>)}
        <Text style={styles.label}>Descripción profesional</Text>
        <Field multiline placeholder="Descripción profesional" value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
        <Text style={styles.label}>Experiencia laboral</Text>
        <Field multiline placeholder="Experiencia laboral" value={form.workExperienceDescription} onChangeText={(workExperienceDescription) => setForm({ ...form, workExperienceDescription })} />
        <Button title={form.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={() => profileImage.mutate(undefined, { onSuccess: (url) => setForm({ ...form, profilePhotoUrl: url ?? form.profilePhotoUrl }) })} loading={profileImage.isPending} />
        <Button title={form.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={() => document.mutate('DOCUMENT', { onSuccess: (url) => setForm({ ...form, documentPhotoUrl: url ?? form.documentPhotoUrl }) })} loading={document.isPending} />
        <Button title={form.certificatePhotoUrl ? 'Certificado cargado' : 'Subir certificado opcional'} onPress={() => document.mutate('CERTIFICATE', { onSuccess: (url) => setForm({ ...form, certificatePhotoUrl: url ?? form.certificatePhotoUrl }) })} loading={document.isPending} />
        <CatalogSelect label="País" value={form.countryId} items={countries.data} onChange={(country) => setForm({ ...form, countryId: country.id, departmentId: '', cityId: '', homeCity: '' })} />
        <CatalogSelect label="Departamento" value={form.departmentId} items={departments.data} disabled={!form.countryId} onChange={(department) => setForm({ ...form, departmentId: department.id, cityId: '', homeCity: '' })} />
        <CatalogSelect label="Ciudad" value={form.cityId} items={cities.data} disabled={!form.departmentId} onChange={(city) => setForm({ ...form, cityId: city.id, homeCity: city.name })} />
        <Text style={styles.label}>Dirección de domicilio</Text>
        <Field placeholder="Dirección domicilio" value={form.homeAddress} onChangeText={(homeAddress) => setForm({ ...form, homeAddress })} />
        <Text style={styles.label}>Barrio</Text>
        <Field placeholder="Barrio" value={form.homeNeighborhood} onChangeText={(homeNeighborhood) => setForm({ ...form, homeNeighborhood })} />
        <Button title={form.latitude && form.longitude ? 'Ubicación GPS lista' : 'Obtener mi ubicación GPS'} onPress={useGps} loading={location.isLocating} />
        {(!form.countryId || !form.departmentId || !form.cityId) && <Text style={styles.error}>Selecciona país, departamento y ciudad.</Text>}
        {(location.error || profileImage.error || document.error || save.error) && <Text style={styles.error}>{location.error || apiMessage(profileImage.error ?? document.error ?? save.error)}</Text>}
        <Button title={profile.data ? 'Actualizar perfil' : 'Crear perfil'} onPress={() => {
          if (!form.countryId || !form.departmentId || !form.cityId) return
          save.mutate(form)
        }} loading={save.isPending} />
        <Button title="Modificar contraseña" onPress={() => setPasswordModal(true)} />
        <PasswordChangeModal visible={passwordModal} onClose={() => setPasswordModal(false)} /></>
    </QueryState>
  </KeyboardAwareScreen>
}
