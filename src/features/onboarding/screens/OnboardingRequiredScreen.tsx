import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, colors, styles as uiStyles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { apiMessage } from '../../../shared/apiMessage'
import { CatalogSelect } from '../../catalogs/CatalogSelect'
import { useCities, useCountries, useDepartments } from '../../catalogs/hooks'
import { useProfile } from '../../profile/hooks'
import { pickAndUploadEvidence, pickAndUploadImageAsset } from '../../../services/files'
import { onboardingApi, type DocumentType, type OnboardingMainData } from '../api'

const labels: Record<string, string> = {
  MAIN_DATA: 'Datos principales',
  LEGAL_ACCEPTANCE: 'Documentos legales',
  PROFILE_SELFIE: 'Foto de perfil',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  TECHNICIAN_CERTIFICATE: 'Certificado técnico opcional',
  COMPLETED: 'Finalizar inscripción',
}

export function OnboardingRequiredScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'OnboardingRequired'>) {
  const queryClient = useQueryClient()
  const { session } = useSession()
  const profile = useProfile()
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, refetchInterval: 10_000 })
  const [main, setMain] = useState<OnboardingMainData>({
    fullName: session?.fullName ?? '',
    phone: profile.data?.phone ?? '',
    countryId: profile.data?.countryId ?? '',
    departmentId: profile.data?.departmentId ?? '',
    cityId: profile.data?.cityId ?? '',
    address: profile.data?.homeAddress ?? '',
    neighborhood: profile.data?.homeNeighborhood ?? '',
    documentType: 'CC',
    documentNumber: '',
  })
  const countries = useCountries()
  const departments = useDepartments(main.countryId)
  const cities = useCities(main.departmentId)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [frontUrl, setFrontUrl] = useState('')
  const [backUrl, setBackUrl] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')

  useEffect(() => {
    if (!profile.data) return
    setMain((current) => ({
      ...current,
      phone: current.phone || profile.data.phone || '',
      countryId: current.countryId || profile.data.countryId || '',
      departmentId: current.departmentId || profile.data.departmentId || '',
      cityId: current.cityId || profile.data.cityId || '',
      address: current.address || profile.data.homeAddress || '',
      neighborhood: current.neighborhood || profile.data.homeNeighborhood || '',
      documentType: current.documentType || profile.data.documentType || 'CC',
      documentNumber: current.documentNumber || profile.data.documentNumber || '',
    }))
  }, [profile.data])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })
  const mainMutation = useMutation({ mutationFn: onboardingApi.mainData, onSuccess: refresh })
  const legalMutation = useMutation({ mutationFn: onboardingApi.legalAcceptance, onSuccess: refresh })
  const selfieMutation = useMutation({ mutationFn: onboardingApi.profileSelfie, onSuccess: refresh })
  const documentMutation = useMutation({ mutationFn: onboardingApi.identityDocument, onSuccess: refresh })
  const certificateMutation = useMutation({ mutationFn: onboardingApi.certificate, onSuccess: refresh })
  const skipCertificate = useMutation({ mutationFn: onboardingApi.skipCertificate, onSuccess: refresh })
  const complete = useMutation({
    mutationFn: onboardingApi.complete,
    onSuccess: () => navigation.navigate(session?.role === 'TECHNICIAN' ? 'AvailableRequests' : 'Home'),
  })
  const pending = mainMutation.isPending || legalMutation.isPending || selfieMutation.isPending
    || documentMutation.isPending || certificateMutation.isPending || skipCertificate.isPending || complete.isPending
  const error = mainMutation.error || legalMutation.error || selfieMutation.error || documentMutation.error
    || certificateMutation.error || skipCertificate.error || complete.error || status.error
  const step = status.data?.currentStep ?? 'MAIN_DATA'

  async function pickImage(kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE', setUrl: (url: string) => void) {
    Alert.alert('Seleccionar archivo', 'Elige cómo quieres cargar la imagen.', [
      { text: 'Cámara', onPress: () => void pickAndUploadImageAsset(kind, 'camera').then((url) => url && setUrl(url)).catch((err) => Alert.alert('No fue posible cargar', apiMessage(err))) },
      { text: 'Galería', onPress: () => void pickAndUploadImageAsset(kind, 'gallery').then((url) => url && setUrl(url)).catch((err) => Alert.alert('No fue posible cargar', apiMessage(err))) },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  async function pickDocument(setUrl: (url: string) => void) {
    Alert.alert('Documento', 'Puedes tomar una foto, elegir de galería o seleccionar un PDF.', [
      { text: 'Cámara', onPress: () => void pickAndUploadImageAsset('DOCUMENT', 'camera').then((url) => url && setUrl(url)).catch((err) => Alert.alert('No fue posible cargar', apiMessage(err))) },
      { text: 'Galería', onPress: () => void pickAndUploadImageAsset('DOCUMENT', 'gallery').then((url) => url && setUrl(url)).catch((err) => Alert.alert('No fue posible cargar', apiMessage(err))) },
      { text: 'PDF/archivo', onPress: () => void pickAndUploadEvidence('DOCUMENT').then((url) => url && setUrl(url)).catch((err) => Alert.alert('No fue posible cargar', apiMessage(err))) },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  return <KeyboardAwareScreen>
    <Text style={uiStyles.title}>Completa tu inscripción</Text>
    <Text style={uiStyles.subtitle}>Paso actual: {labels[step]}</Text>
    {error && <Text style={uiStyles.error}>{apiMessage(error)}</Text>}

    {step === 'MAIN_DATA' && <Card>
      <Field placeholder="Nombre completo" value={main.fullName} onChangeText={(fullName) => setMain({ ...main, fullName })} />
      <Field placeholder="Teléfono" value={main.phone} onChangeText={(phone) => setMain({ ...main, phone })} keyboardType="phone-pad" />
      <CatalogSelect label="País" value={main.countryId} items={countries.data} onChange={(item) => setMain({ ...main, countryId: item.id, departmentId: '', cityId: '' })} />
      <CatalogSelect label="Departamento" value={main.departmentId} items={departments.data} disabled={!main.countryId} onChange={(item) => setMain({ ...main, departmentId: item.id, cityId: '' })} />
      <CatalogSelect label="Ciudad" value={main.cityId} items={cities.data} disabled={!main.departmentId} onChange={(item) => setMain({ ...main, cityId: item.id })} />
      <Field placeholder="Dirección" value={main.address} onChangeText={(address) => setMain({ ...main, address })} />
      <Field placeholder="Barrio" value={main.neighborhood} onChangeText={(neighborhood) => setMain({ ...main, neighborhood })} />
      <Text style={uiStyles.label}>Tipo de documento</Text>
      <View style={screenStyles.row}>
        <Choice label="Cédula" active={main.documentType === 'CC'} onPress={() => setMain({ ...main, documentType: 'CC' })} />
        <Choice label="Pasaporte" active={main.documentType === 'PASSPORT'} onPress={() => setMain({ ...main, documentType: 'PASSPORT' })} />
      </View>
      <Field placeholder="Número de documento" value={main.documentNumber} onChangeText={(documentNumber) => setMain({ ...main, documentNumber })} />
      <Button title="Guardar y continuar" loading={pending} onPress={() => mainMutation.mutate(main)} />
    </Card>}

    {step === 'LEGAL_ACCEPTANCE' && <Card>
      <Text style={uiStyles.cardTitle}>Documentos legales</Text>
      <Text style={uiStyles.muted}>Debes aceptar términos, privacidad y seguridad para continuar usando TecnGo.</Text>
      <Button title="Ver documentos" onPress={() => navigation.navigate('Legal')} />
      <Button title="Aceptar y continuar" loading={pending} onPress={() => legalMutation.mutate()} />
    </Card>}

    {step === 'PROFILE_SELFIE' && <Card>
      <Text style={uiStyles.cardTitle}>Foto de perfil</Text>
      <Text style={uiStyles.muted}>Carga una foto clara de tu rostro. Después quedará bloqueada para cambios directos.</Text>
      <UploadStatus label="Selfie" ready={Boolean(profilePhotoUrl)} />
      <Button title="Tomar o seleccionar foto" onPress={() => void pickImage('PROFILE', setProfilePhotoUrl)} />
      <Button title="Guardar selfie" loading={pending} onPress={() => selfieMutation.mutate(profilePhotoUrl)} />
    </Card>}

    {step === 'IDENTITY_DOCUMENT' && <Card>
      <Text style={uiStyles.cardTitle}>{main.documentType === 'CC' ? 'Cédula de ciudadanía' : 'Pasaporte'}</Text>
      {main.documentType === 'CC' ? <>
        <UploadStatus label="Frente" ready={Boolean(frontUrl)} />
        <Button title="Cargar frente" onPress={() => void pickDocument(setFrontUrl)} />
        <UploadStatus label="Reverso" ready={Boolean(backUrl)} />
        <Button title="Cargar reverso" onPress={() => void pickDocument(setBackUrl)} />
        <Button title="Guardar documento" loading={pending} onPress={() => documentMutation.mutate({ documentType: 'CC', documentFrontUrl: frontUrl, documentBackUrl: backUrl })} />
      </> : <>
        <UploadStatus label="Página principal" ready={Boolean(singleUrl)} />
        <Button title="Cargar pasaporte" onPress={() => void pickDocument(setSingleUrl)} />
        <Button title="Guardar documento" loading={pending} onPress={() => documentMutation.mutate({ documentType: 'PASSPORT', documentSingleUrl: singleUrl })} />
      </>}
    </Card>}

    {step === 'TECHNICIAN_CERTIFICATE' && <Card>
      <Text style={uiStyles.cardTitle}>Certificado técnico</Text>
      <Text style={uiStyles.muted}>Si tienes certificado de estudio o experiencia, cárgalo ahora. También puedes continuar sin certificado.</Text>
      <UploadStatus label="Certificado" ready={Boolean(certificateUrl)} />
      <Button title="Cargar certificado" onPress={() => void pickImage('CERTIFICATE', setCertificateUrl)} />
      <Button title="Guardar certificado" loading={pending} onPress={() => certificateMutation.mutate(certificateUrl)} />
      <Button title="No tengo certificado ahora" loading={pending} onPress={() => skipCertificate.mutate()} />
    </Card>}

    {step === 'COMPLETED' && <Card>
      <Text style={uiStyles.cardTitle}>Inscripción lista</Text>
      <Text style={uiStyles.muted}>Finaliza para entrar a TecnGo.</Text>
      <Button title="Finalizar" loading={pending} onPress={() => complete.mutate()} />
    </Card>}
  </KeyboardAwareScreen>
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[screenStyles.choice, active && screenStyles.choiceActive]}>
    <Text style={[screenStyles.choiceText, active && screenStyles.choiceTextActive]}>{label}</Text>
  </Pressable>
}

function UploadStatus({ label, ready }: { label: string; ready: boolean }) {
  return <View style={screenStyles.uploadRow}>
    <Text style={screenStyles.uploadLabel}>{label}</Text>
    <Text style={[screenStyles.uploadState, ready && screenStyles.uploadReady]}>{ready ? 'Cargado' : 'Pendiente'}</Text>
  </View>
}

const screenStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  choice: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, alignItems: 'center' },
  choiceActive: { borderColor: colors.brand, backgroundColor: '#083344' },
  choiceText: { color: colors.muted, fontWeight: '800' },
  choiceTextActive: { color: colors.brand },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  uploadLabel: { color: colors.text, fontWeight: '800' },
  uploadState: { color: colors.muted, fontWeight: '800' },
  uploadReady: { color: colors.brand },
})
