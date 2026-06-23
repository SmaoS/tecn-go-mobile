import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, colors, styles as uiStyles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { apiMessage } from '../../../shared/apiMessage'
import { CatalogSelect } from '../../catalogs/CatalogSelect'
import { useCities, useCountries, useDepartments } from '../../catalogs/hooks'
import { useProfile } from '../../profile/hooks'
import { pickAndUploadEvidence, pickAndUploadImageAsset, uploadAsset } from '../../../services/files'
import { onboardingApi, type DocumentType, type OnboardingMainData } from '../api'
import { TechnicianProfessionalProfileOnboardingScreen } from './TechnicianProfessionalProfileOnboardingScreen'
import { setStoredSession } from '../../../services/sessionStorage'
import { LegalDocumentsContent } from '../../legal/components/LegalDocumentsContent'
import { FloatingFormFooter } from '../../../components/FloatingFormFooter'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../../../shared/phone'
import { ActionSheet, type ActionSheetOption } from '../../../components/ActionSheet'
import { showToast } from '../../../components/Toast'

const labels: Record<string, string> = {
  MAIN_DATA: 'Datos principales',
  LEGAL_ACCEPTANCE: 'Documentos legales',
  PROFILE_SELFIE: 'Foto de perfil',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  TECHNICIAN_PROFESSIONAL_PROFILE: 'Perfil profesional',
  TECHNICIAN_CERTIFICATE: 'Certificado técnico opcional',
  COMPLETED: 'Inscripción lista',
}

export function OnboardingRequiredScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'OnboardingRequired'>) {
  const queryClient = useQueryClient()
  const { session, setSession } = useSession()
  const profile = useProfile()
  const draftKey = session?.userId ? `tecngo.onboarding.main.${session.userId}` : undefined
  const status = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: onboardingApi.status,
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  })
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
  const [draftLoaded, setDraftLoaded] = useState(false)
  const countries = useCountries()
  const departments = useDepartments(main.countryId)
  const cities = useCities(main.departmentId)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [frontUrl, setFrontUrl] = useState('')
  const [backUrl, setBackUrl] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')
  const [processedSelfieUri, setProcessedSelfieUri] = useState<string>()
  const [processedDocumentKey, setProcessedDocumentKey] = useState<string>()
  const [actionSheet, setActionSheet] = useState<{
    title: string
    message: string
    options: ActionSheetOption[]
  }>()
  const step = status.data?.currentStep ?? 'MAIN_DATA'

  useEffect(() => {
    if (!draftKey) {
      setDraftLoaded(true)
      return
    }
    AsyncStorage.getItem(draftKey)
      .then((raw) => {
        if (raw) setMain((current) => ({ ...current, ...JSON.parse(raw) as OnboardingMainData }))
      })
      .finally(() => setDraftLoaded(true))
  }, [draftKey])

  useEffect(() => {
    if (!draftLoaded || !draftKey || step !== 'MAIN_DATA') return
    void AsyncStorage.setItem(draftKey, JSON.stringify(main))
  }, [draftKey, draftLoaded, main, step])

  useEffect(() => {
    if (!draftLoaded || !profile.data) return
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
  }, [draftLoaded, profile.data])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })
  const mainMutation = useMutation({
    mutationFn: onboardingApi.mainData,
    onSuccess: async () => {
      if (draftKey) await AsyncStorage.removeItem(draftKey)
      await refresh()
    },
  })
  const selfieMutation = useMutation({ mutationFn: onboardingApi.profileSelfie, onSuccess: refresh })
  const documentMutation = useMutation({ mutationFn: onboardingApi.identityDocument, onSuccess: refresh })
  const certificateMutation = useMutation({ mutationFn: onboardingApi.certificate, onSuccess: refresh })
  const skipCertificate = useMutation({ mutationFn: onboardingApi.skipCertificate, onSuccess: refresh })
  const pending = mainMutation.isPending || selfieMutation.isPending
    || documentMutation.isPending || certificateMutation.isPending || skipCertificate.isPending
  const error = mainMutation.error || selfieMutation.error || documentMutation.error
    || certificateMutation.error || skipCertificate.error || status.error

  useEffect(() => {
    if (status.data?.onboardingCompleted) {
      if (session && !session.onboardingCompleted) {
        const next = { ...session, onboardingCompleted: true }
        setSession(next)
        void setStoredSession(JSON.stringify(next))
      }
      navigation.reset({ index: 0, routes: [{ name: session?.role === 'TECHNICIAN' ? 'AvailableRequests' : 'Home' }] })
    }
  }, [navigation, session, setSession, status.data?.onboardingCompleted])

  useEffect(() => {
    const selfieUri = route.params?.selfieUri
    if (!selfieUri || processedSelfieUri === selfieUri || selfieMutation.isPending) return
    setProcessedSelfieUri(selfieUri)
    void uploadAsset({ uri: selfieUri, name: `selfie-${Date.now()}.jpg`, mimeType: 'image/jpeg' }, 'PROFILE')
      .then((url) => selfieMutation.mutate({
        profilePhotoUrl: url,
        faceDetectionStatus: route.params?.faceDetectionStatus ?? 'MANUAL_REVIEW_REQUIRED',
      }))
      .catch((err) => showToast(apiMessage(err), 'error'))
  }, [processedSelfieUri, route.params?.faceDetectionStatus, route.params?.selfieUri, selfieMutation])

  useEffect(() => {
    const frontUri = route.params?.documentFrontUri
    const backUri = route.params?.documentBackUri
    const singleUri = route.params?.documentSingleUri
    const key = `${frontUri ?? ''}|${backUri ?? ''}|${singleUri ?? ''}`
    if ((!singleUri && (!frontUri || !backUri)) || processedDocumentKey === key || documentMutation.isPending) return
    setProcessedDocumentKey(key)
    async function uploadDocuments() {
      if (singleUri) {
        const single = await uploadAsset({ uri: singleUri, name: `passport-${Date.now()}.jpg`, mimeType: 'image/jpeg' }, 'DOCUMENT')
        documentMutation.mutate({
          documentType: 'PASSPORT',
          documentSingleUrl: single,
          identityDocumentCaptureStatus: route.params?.identityDocumentCaptureStatus ?? 'MANUAL_REVIEW_REQUIRED',
        })
      } else if (frontUri && backUri) {
        const front = await uploadAsset({ uri: frontUri, name: `document-front-${Date.now()}.jpg`, mimeType: 'image/jpeg' }, 'DOCUMENT')
        const back = await uploadAsset({ uri: backUri, name: `document-back-${Date.now()}.jpg`, mimeType: 'image/jpeg' }, 'DOCUMENT')
        documentMutation.mutate({
          documentType: 'CC',
          documentFrontUrl: front,
          documentBackUrl: back,
          identityDocumentCaptureStatus: route.params?.identityDocumentCaptureStatus ?? 'MANUAL_REVIEW_REQUIRED',
        })
      }
    }
    void uploadDocuments().catch((err) => showToast(apiMessage(err), 'error'))
  }, [documentMutation, processedDocumentKey, route.params?.documentBackUri, route.params?.documentFrontUri, route.params?.documentSingleUri, route.params?.identityDocumentCaptureStatus])

  async function pickImage(kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE', setUrl: (url: string) => void) {
    setActionSheet({
      title: 'Seleccionar archivo',
      message: 'Elige cómo quieres cargar la imagen.',
      options: [
        { label: 'Tomar foto con cámara', onPress: () => void pickAndUploadImageAsset(kind, 'camera').then((url) => url && setUrl(url)).catch((err) => showToast(apiMessage(err), 'error')) },
        { label: 'Seleccionar de galería', onPress: () => void pickAndUploadImageAsset(kind, 'gallery').then((url) => url && setUrl(url)).catch((err) => showToast(apiMessage(err), 'error')) },
      ],
    })
  }

  async function pickDocument(setUrl: (url: string) => void) {
    setActionSheet({
      title: 'Documento',
      message: 'Puedes tomar una foto, elegir de galería o seleccionar un PDF.',
      options: [
        { label: 'Tomar foto con cámara', onPress: () => void pickAndUploadImageAsset('DOCUMENT', 'camera').then((url) => url && setUrl(url)).catch((err) => showToast(apiMessage(err), 'error')) },
        { label: 'Seleccionar de galería', onPress: () => void pickAndUploadImageAsset('DOCUMENT', 'gallery').then((url) => url && setUrl(url)).catch((err) => showToast(apiMessage(err), 'error')) },
        { label: 'PDF o archivo', onPress: () => void pickAndUploadEvidence('DOCUMENT').then((url) => url && setUrl(url)).catch((err) => showToast(apiMessage(err), 'error')) },
      ],
    })
  }

  const mainDisabled = !main.fullName.trim() || Boolean(main.phone) && !isValidLocalPhone(main.phone) || !main.countryId || !main.departmentId
    || !main.cityId || !main.address.trim() || !main.documentNumber.trim()
  return <KeyboardAwareScreen footer={step === 'MAIN_DATA'
    ? <FloatingFormFooter
      testID="e2e.onboarding.main.submit"
      title="Guardar y continuar"
      loading={pending}
      disabled={mainDisabled}
      onPress={() => mainMutation.mutate(main)}
    />
    : undefined}
  >
    <Text style={uiStyles.title}>Completa tu inscripción</Text>
    <Text style={uiStyles.subtitle}>Paso actual: {labels[step]}</Text>
    {error && <Text style={uiStyles.error}>{apiMessage(error)}</Text>}

    {step === 'MAIN_DATA' && <Card>
      <Text style={uiStyles.muted}>Los campos marcados con * son obligatorios.</Text>
      <Text style={uiStyles.label}>Nombre completo *</Text>
      <Field testID="e2e.onboarding.fullName" placeholder="Nombre completo" value={main.fullName} onChangeText={(fullName) => setMain({ ...main, fullName })} />
      <Text style={uiStyles.label}>Teléfono</Text>
      <Field testID="e2e.onboarding.phone" placeholder="Teléfono" value={main.phone} onChangeText={(phone) => setMain({ ...main, phone: normalizeLocalPhone(phone) })} keyboardType="number-pad" maxLength={10} />
      {main.phone && !isValidLocalPhone(main.phone) && <Text style={uiStyles.error}>{localPhoneHint}</Text>}
      <CatalogSelect label="País" value={main.countryId} items={countries.data} onChange={(item) => setMain({ ...main, countryId: item.id, departmentId: '', cityId: '' })} />
      <CatalogSelect label="Departamento" value={main.departmentId} items={departments.data} disabled={!main.countryId} onChange={(item) => setMain({ ...main, departmentId: item.id, cityId: '' })} />
      <CatalogSelect label="Ciudad" value={main.cityId} items={cities.data} disabled={!main.departmentId} onChange={(item) => setMain({ ...main, cityId: item.id })} />
      <Text style={uiStyles.label}>Dirección *</Text>
      <Field testID="e2e.onboarding.address" placeholder="Dirección" value={main.address} onChangeText={(address) => setMain({ ...main, address })} />
      <Text style={uiStyles.label}>Barrio</Text>
      <Field testID="e2e.onboarding.neighborhood" placeholder="Barrio" value={main.neighborhood} onChangeText={(neighborhood) => setMain({ ...main, neighborhood })} />
      <Text style={uiStyles.label}>Tipo de documento *</Text>
      <View style={screenStyles.row}>
        <Choice label="Cédula" active={main.documentType === 'CC'} onPress={() => setMain({ ...main, documentType: 'CC' })} />
        <Choice label="Pasaporte" active={main.documentType === 'PASSPORT'} onPress={() => setMain({ ...main, documentType: 'PASSPORT' })} />
      </View>
      <Text style={uiStyles.label}>Número de documento *</Text>
      <Field testID="e2e.onboarding.documentNumber" placeholder="Número de documento" value={main.documentNumber} onChangeText={(documentNumber) => setMain({ ...main, documentNumber })} />
    </Card>}

    {step === 'LEGAL_ACCEPTANCE' && <>
      <Text style={uiStyles.subtitle}>Lee todos los documentos antes de continuar.</Text>
      <LegalDocumentsContent
        testID="e2e.onboarding.legal.submit"
        buttonTitle="Aceptar todos y continuar"
        onAccepted={refresh}
      />
    </>}

    {step === 'PROFILE_SELFIE' && <Card>
      <Text style={uiStyles.cardTitle}>Foto de perfil</Text>
      <Text style={uiStyles.muted}>Ubica tu rostro dentro del óvalo. Después quedará bloqueada para cambios directos.</Text>
      <UploadStatus label="Selfie" ready={Boolean(profilePhotoUrl)} />
      <Button title="Tomar foto rostro" onPress={() => navigation.navigate('CaptureSelfie')} />
      <Button title="Seleccionar de galería" onPress={() => void pickImage('PROFILE', setProfilePhotoUrl)} />
      <Button title="Guardar selfie" loading={pending} onPress={() => selfieMutation.mutate({ profilePhotoUrl, faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED' })} />
    </Card>}

    {step === 'IDENTITY_DOCUMENT' && <Card>
      <Text style={uiStyles.cardTitle}>{main.documentType === 'CC' ? 'Cédula de ciudadanía' : 'Pasaporte'}</Text>
      {main.documentType === 'CC' ? <>
        <UploadStatus label="Frente" ready={Boolean(frontUrl)} />
        <Button title="Tomar foto documento" onPress={() => navigation.navigate('CaptureIdentityDocument', { documentType: 'CC' })} />
        <Button title="Cargar frente desde galería/archivo" onPress={() => void pickDocument(setFrontUrl)} />
        <UploadStatus label="Reverso" ready={Boolean(backUrl)} />
        <Button title="Cargar reverso desde galería/archivo" onPress={() => void pickDocument(setBackUrl)} />
        <Button title="Continuar" loading={pending} onPress={() => documentMutation.mutate({ documentType: 'CC', documentFrontUrl: frontUrl, documentBackUrl: backUrl, identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED' })} />
      </> : <>
        <UploadStatus label="Página principal" ready={Boolean(singleUrl)} />
        <Button title="Tomar foto pasaporte" onPress={() => navigation.navigate('CaptureIdentityDocument', { documentType: 'PASSPORT' })} />
        <Button title="Cargar pasaporte desde galería/archivo" onPress={() => void pickDocument(setSingleUrl)} />
        <Button title="Continuar" loading={pending} onPress={() => documentMutation.mutate({ documentType: 'PASSPORT', documentSingleUrl: singleUrl, identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED' })} />
      </>}
    </Card>}

    {step === 'TECHNICIAN_PROFESSIONAL_PROFILE'
      && <TechnicianProfessionalProfileOnboardingScreen onComplete={refresh} />}

    {step === 'TECHNICIAN_CERTIFICATE' && <Card>
      <Text style={uiStyles.cardTitle}>Certificado técnico</Text>
      <Text style={uiStyles.muted}>Si tienes certificado de estudio o experiencia, cárgalo ahora. También puedes continuar sin certificado.</Text>
      <UploadStatus label="Certificado" ready={Boolean(certificateUrl)} />
      <Button title="Cargar certificado" onPress={() => void pickImage('CERTIFICATE', setCertificateUrl)} />
      <Button title="Guardar certificado" loading={pending} onPress={() => certificateMutation.mutate(certificateUrl)} />
      <Button title="No tengo certificado ahora" loading={pending} onPress={() => skipCertificate.mutate()} />
    </Card>}
    <ActionSheet
      visible={Boolean(actionSheet)}
      title={actionSheet?.title ?? ''}
      message={actionSheet?.message}
      options={actionSheet?.options ?? []}
      onClose={() => setActionSheet(undefined)}
    />
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
  choiceActive: { borderColor: colors.brand, backgroundColor: '#063A18' },
  choiceText: { color: colors.muted, fontWeight: '800' },
  choiceTextActive: { color: colors.brand },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  uploadLabel: { color: colors.text, fontWeight: '800' },
  uploadState: { color: colors.muted, fontWeight: '800' },
  uploadReady: { color: colors.brand },
})
