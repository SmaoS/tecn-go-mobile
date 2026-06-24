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
import { PasswordChangeModal } from '../components/PasswordChangeModal'
import { useDoubleBackExit } from '../../../hooks/useDoubleBackExit'
import { CatalogSelect } from '../../catalogs/CatalogSelect'
import { useCities, useCountries, useDepartments } from '../../catalogs/hooks'
import { authApi } from '../../auth/api'
import { useMutation } from '@tanstack/react-query'
import { showToast } from '../../../components/Toast'
import { profileApi } from '../api'
import { FloatingFormFooter } from '../../../components/FloatingFormFooter'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../../../shared/phone'

export function ProfileScreen({ session, onLogout, navigation, rootExit = false }: { session: Session; onLogout: () => void; navigation?: { navigate: (screen: 'CaptureProfilePhoto' | 'Legal') => void }; rootExit?: boolean }) {
  useDoubleBackExit(rootExit)
  const profile = useProfile()
  const save = useSaveProfile()
  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [passwordModal, setPasswordModal] = useState(false)
  const [phoneCode, setPhoneCode] = useState('')
  const location = useCurrentLocation()
  const profileImage = useProfileImageUpload()
  const document = useDocumentUpload()
  const verifyEmail = useVerifyEmail()
  const current = draft ?? profile.data
  const countries = useCountries()
  const departments = useDepartments(current?.countryId)
  const cities = useCities(current?.departmentId)
  const selectedCountry = countries.data?.find((country) => country.id === current?.countryId)
  const sendPhoneOtp = useMutation({
    mutationFn: authApi.sendPhoneOtp,
    onSuccess: (data) => showToast(data.debugCode ? `Código de desarrollo: ${data.debugCode}` : 'Código enviado por SMS', 'info'),
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const verifyPhoneOtp = useMutation({
    mutationFn: async ({ phone, code, countryId }: { phone: string; code: string; countryId?: string }) => {
      const verification = await authApi.verifyPhoneOtp(phone, code, countryId)
      return profileApi.verifyPhone(phone, verification.verificationToken)
    },
    onSuccess: async () => {
      await profile.refetch()
      showToast('Celular verificado correctamente')
    },
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  function update(value: Partial<UserProfile>) {
    if (current) setDraft({ ...current, ...value })
  }
  const phoneVerificationRequired = Boolean(current?.phone)
    && (!profile.data?.phoneVerified || normalizeLocalPhone(current?.phone) !== normalizeLocalPhone(profile.data.phone))
  async function useHomeGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) update({ homeLatitude: coordinates.latitude, homeLongitude: coordinates.longitude })
  }
  function submit() {
    if (!current?.documentPhotoUrl) { showToast('El documento es obligatorio', 'error'); return }
    if (!current.countryId || !current.departmentId || !current.cityId) {
      showToast('Selecciona país, departamento y ciudad', 'error')
      return
    }
    save.mutate(current, {
      onSuccess: () => { setDraft(null); showToast('Perfil actualizado') },
    })
  }
  const verificationLabel = current?.verificationStatus === 'VERIFIED'
    ? 'Identidad verificada'
    : current?.verificationStatus === 'PENDING_VERIFICATION'
      ? 'Documento pendiente de verificación'
      : 'Carga tu documento para iniciar la verificación'
  return <KeyboardAwareScreen footer={current ? <FloatingFormFooter title="Guardar perfil" onPress={submit} loading={save.isPending} /> : undefined}><QueryState pending={profile.isPending} error={profile.error}>
    {current && <><Card><Text style={[styles.muted, { color: colors.brand }]}>{verificationLabel}</Text>{phoneVerificationRequired && current.phone && <Text style={[styles.muted, { color: colors.brand }]}>Celular pendiente de validacion OTP</Text>}<Text style={styles.muted}>Correo: {current.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {current.documentsVerified ? 'verificados' : 'pendientes'}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {current.averageRating.toFixed(1)} · {current.paidServicesCount} servicios pagados</Text></Card>
      <Field value={session.email ?? current.phone ?? 'Cuenta por celular'} editable={false} selectTextOnFocus={false} accessibilityLabel="Contacto registrado" />
      <Text style={styles.muted}>Los campos marcados con * son obligatorios.</Text>
      <Text style={styles.label}>Nombre completo *</Text>
      <Field placeholder="Nombre completo" value={current.fullName} onChangeText={(fullName) => update({ fullName })} />
      <Text style={styles.label}>Teléfono {selectedCountry?.phonePrefix ? `(${selectedCountry.phonePrefix})` : ''}</Text>
      <Field placeholder="Teléfono" keyboardType="number-pad" maxLength={10} value={current.phone ?? ''} onChangeText={(phone) => {
        setPhoneCode('')
        update({ phone: normalizeLocalPhone(phone) })
      }} />
      {current.phone && !isValidLocalPhone(current.phone) && <Text style={styles.error}>{localPhoneHint}</Text>}
      {phoneVerificationRequired && <>
        <Button title="Enviar código OTP al celular" onPress={() => sendPhoneOtp.mutate({ phone: current.phone!, countryId: current.countryId })} loading={sendPhoneOtp.isPending} disabled={!isValidLocalPhone(current.phone)} />
        <Field placeholder="Ingresa Código OTP" keyboardType="number-pad" value={phoneCode} onChangeText={(value) => setPhoneCode(value.replace(/\D/g, ''))} />
        <Button title="Verificar código" onPress={() => verifyPhoneOtp.mutate({ phone: current.phone!, code: phoneCode, countryId: current.countryId })} loading={verifyPhoneOtp.isPending} disabled={!phoneCode || !isValidLocalPhone(current.phone)} />
      </>}
      {!phoneVerificationRequired && current.phone && <Text style={[styles.muted, { color: colors.brand }]}>Celular verificado</Text>}
      <CatalogSelect label="País" value={current.countryId} items={countries.data} onChange={(country) => update({ countryId: country.id, countryName: country.name, departmentId: undefined, departmentName: undefined, cityId: undefined, cityName: undefined, homeCity: undefined })} />
      <CatalogSelect label="Departamento" value={current.departmentId} items={departments.data} disabled={!current.countryId} onChange={(department) => update({ departmentId: department.id, departmentName: department.name, cityId: undefined, cityName: undefined, homeCity: undefined })} />
      <CatalogSelect label="Ciudad" value={current.cityId} items={cities.data} disabled={!current.departmentId} onChange={(city) => update({ cityId: city.id, cityName: city.name, homeCity: city.name })} />
      <Text style={styles.label}>Dirección de domicilio *</Text>
      <Field placeholder="Dirección domicilio" value={current.homeAddress ?? ''} onChangeText={(homeAddress) => update({ homeAddress })} />
      <Text style={styles.label}>Barrio</Text>
      <Field placeholder="Barrio" value={current.homeNeighborhood ?? ''} onChangeText={(homeNeighborhood) => update({ homeNeighborhood })} />
      <Button title={current.homeLatitude != null && current.homeLongitude != null ? 'Ubicación de domicilio lista' : 'Obtener ubicación del domicilio'} onPress={useHomeGps} loading={location.isLocating} />      
      {navigation && !current.profilePhotoFaceValidated && <Button title="Tomar foto de perfil con cámara" onPress={() => navigation.navigate('CaptureProfilePhoto')} />}
      <Button title={current.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={() => document.mutate('DOCUMENT', { onSuccess: (url) => update({ documentPhotoUrl: url ?? current.documentPhotoUrl }) })} loading={document.isPending} />
      {(location.error || save.error || profileImage.error || document.error) && <Text style={(save.error || profileImage.error || document.error) ? styles.error : styles.muted}>{save.error || profileImage.error || document.error ? apiMessage(save.error ?? profileImage.error ?? document.error) : location.error}</Text>}
      {!current.emailVerified && <Button title="Verificar correo" loading={verifyEmail.isPending} onPress={() => verifyEmail.mutate(undefined, { onSuccess: () => showToast('Correo de verificación enviado', 'info'), onError: (error) => showToast(apiMessage(error), 'error') })} />}</>}
      <Button title="Modificar contraseña" onPress={() => setPasswordModal(true)} />
  </QueryState>
    <PasswordChangeModal visible={passwordModal} onClose={() => setPasswordModal(false)} />
  </KeyboardAwareScreen>
}
