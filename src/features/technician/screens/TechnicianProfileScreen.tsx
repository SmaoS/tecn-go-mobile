import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
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
import { authApi } from '../../auth/api'
import { profileApi } from '../../profile/api'
import { showToast } from '../../../components/Toast'
import { useSession } from '../../../context/useSession'
import { FloatingFormFooter } from '../../../components/FloatingFormFooter'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../../../shared/phone'

const empty: TechnicianProfileForm = {
  documentNumber: '', phone: '', categoryIds: [], profilePhotoUrl: '',
  documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '',
  latitude: '', longitude: '', homeAddress: '', homeLatitude: '', homeLongitude: '',
  homeCity: '', homeNeighborhood: '', countryId: '', departmentId: '', cityId: '',
}

export function TechnicianProfileScreen() {
  const profile = useTechnicianProfile()
  const categories = useTechnicianCategories()
  const [form, setForm] = useState(empty)
  const [passwordModal, setPasswordModal] = useState(false)
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('')
  const [verifiedPhone, setVerifiedPhone] = useState('')
  const { session, setSession } = useSession()
  const location = useCurrentLocation()
  const profileImage = useProfileImageUpload()
  const document = useDocumentUpload()
  const countries = useCountries()
  const departments = useDepartments(form.countryId)
  const cities = useCities(form.departmentId)
  const selectedCountry = countries.data?.find((country) => country.id === form.countryId)
  const sendPhoneOtp = useMutation({
    mutationFn: authApi.sendPhoneOtp,
    onSuccess: (data) => showToast(data.debugCode ? `Código de desarrollo: ${data.debugCode}` : 'Código enviado por SMS', 'info'),
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const verifyPhoneOtp = useMutation({
    mutationFn: ({ phone, code, countryId }: { phone: string; code: string; countryId?: string }) => authApi.verifyPhoneOtp(phone, code, countryId),
    onSuccess: (data) => {
      setPhoneVerificationToken(data.verificationToken)
      showToast('Código OTP verificado')
    },
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const confirmPhone = useMutation({
    mutationFn: () => profileApi.verifyPhone(form.phone, phoneVerificationToken),
    onSuccess: async () => {
      setPhoneCode('')
      setPhoneVerificationToken('')
      setVerifiedPhone(normalizeLocalPhone(form.phone))
      if (session) setSession({ ...session, phoneVerified: true })
      showToast('Celular verificado correctamente')
    },
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  useEffect(() => {
    if (!profile.data) return
    const data = profile.data
    if (data.phoneVerified) setVerifiedPhone(normalizeLocalPhone(data.phone))
    setForm({
      documentNumber: data.documentNumber, phone: data.phone,
      categoryIds: data.categories.map((item) => item.id),
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
  const requiresPhoneVerification = Boolean(form.phone)
    && normalizeLocalPhone(form.phone) !== verifiedPhone
  const saveProfile = () => {
    if (!form.countryId || !form.departmentId || !form.cityId) return
    save.mutate(form, { onSuccess: () => showToast('Perfil técnico actualizado') })
  }
  return <KeyboardAwareScreen footer={<FloatingFormFooter title={profile.data ? 'Actualizar perfil' : 'Crear perfil'} onPress={saveProfile} loading={save.isPending} disabled={!form.countryId || !form.departmentId || !form.cityId} />}><Text style={styles.title}>Perfil técnico</Text><Text style={styles.subtitle}>{profile.data ? `Estado profesional: ${profile.data.status} · ${identityStatus}` : 'Completa tus datos para solicitar aprobación.'}</Text>
    <QueryState pending={profile.isPending || categories.isPending} error={profileError ?? categories.error}>
      <>{profile.data?.email && <><Text style={styles.label}>Correo</Text><Field value={profile.data.email} editable={false} selectTextOnFocus={false} accessibilityLabel="Correo registrado" /></>}
        <Text style={styles.muted}>Los campos marcados con * son obligatorios.</Text>
        <Text style={styles.label}>Nro Documento *</Text>
        <Field placeholder="Nro Documento" value={form.documentNumber} onChangeText={(documentNumber) => setForm({ ...form, documentNumber })} />
        <Text style={styles.label}>Teléfono * {selectedCountry?.phonePrefix ? `(${selectedCountry.phonePrefix})` : ''}</Text>
        <Field placeholder="Teléfono" value={form.phone} keyboardType="number-pad" maxLength={10} onChangeText={(phone) => {
          setForm({ ...form, phone: normalizeLocalPhone(phone) })
          setPhoneCode('')
          setPhoneVerificationToken('')
        }} />
        {form.phone && !isValidLocalPhone(form.phone) && <Text style={styles.error}>{localPhoneHint}</Text>}
        {requiresPhoneVerification && <>
          <Button title="Enviar código al celular" onPress={() => sendPhoneOtp.mutate({ phone: form.phone, countryId: form.countryId })} loading={sendPhoneOtp.isPending} disabled={!isValidLocalPhone(form.phone)} />
          <Field placeholder="Código OTP" keyboardType="number-pad" value={phoneCode} onChangeText={(value) => setPhoneCode(value.replace(/\D/g, ''))} />
          {!phoneVerificationToken
            ? <Button title="Verificar celular" disabled={!phoneCode || !isValidLocalPhone(form.phone)} loading={verifyPhoneOtp.isPending} onPress={() => verifyPhoneOtp.mutate({ phone: form.phone, code: phoneCode, countryId: form.countryId })} />
            : <Button title="Confirmar celular verificado" loading={confirmPhone.isPending} onPress={() => confirmPhone.mutate()} />}
        </>}
        {!requiresPhoneVerification && <Text style={[styles.muted, { color: colors.brand }]}>Celular verificado</Text>}
        <Text style={styles.label}>Categorías *</Text>{categories.data?.map((category) => <Pressable key={category.id} onPress={() => setForm({ ...form, categoryIds: form.categoryIds.includes(category.id) ? form.categoryIds.filter((id) => id !== category.id) : [...form.categoryIds, category.id] })}><Card><Text style={[styles.cardTitle, form.categoryIds.includes(category.id) && { color: colors.brand }]}>{form.categoryIds.includes(category.id) ? '✓ ' : ''}{category.name}</Text></Card></Pressable>)}
        <Text style={styles.label}>Experiencia laboral *</Text>
        <Field multiline placeholder="Describe tu experiencia laboral" value={form.workExperienceDescription} onChangeText={(workExperienceDescription) => setForm({ ...form, workExperienceDescription })} />
        {!profile.data?.profilePhotoFaceValidated && <Button title={form.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={() => profileImage.mutate(undefined, { onSuccess: (url) => setForm({ ...form, profilePhotoUrl: url ?? form.profilePhotoUrl }) })} loading={profileImage.isPending} />}
        <Button title={form.documentPhotoUrl ? 'Documento de Identidad cargado' : 'Subir documento de identidad obligatorio'} onPress={() => document.mutate('DOCUMENT', { onSuccess: (url) => setForm({ ...form, documentPhotoUrl: url ?? form.documentPhotoUrl }) })} loading={document.isPending} />
        <Button title={form.certificatePhotoUrl ? 'Certificado De estudio cargado' : 'Subir certificado de estudio opcional'} onPress={() => document.mutate('CERTIFICATE', { onSuccess: (url) => setForm({ ...form, certificatePhotoUrl: url ?? form.certificatePhotoUrl }) })} loading={document.isPending} />
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
        <Button title="Modificar contraseña" onPress={() => setPasswordModal(true)} />
        <PasswordChangeModal visible={passwordModal} onClose={() => setPasswordModal(false)} /></>
    </QueryState>
  </KeyboardAwareScreen>
}
