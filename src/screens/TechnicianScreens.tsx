import { useCallback, useEffect, useState } from 'react'
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import axios from 'axios'
import * as Location from 'expo-location'
import { api } from '../api/client'
import { Button, Card, Field, LoadingOverlay, Screen, colors, styles } from '../components/UI'
import type { Category, FinancialSummary, RequestStatus, RootStackParamList, ServiceRequest, TechnicianProfile, UnreadCount } from '../types'
import { pickAndUploadEvidence, pickAndUploadImage } from '../services/files'
import { usePolling } from '../hooks/usePolling'

type Props<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>

const message = (error: unknown) => axios.isAxiosError(error)
  ? error.response?.data?.message ?? 'No fue posible completar la operación'
  : 'Error inesperado'

export function TechnicianHomeScreen({ navigation }: Props<'TechnicianHome'>) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [earnings, setEarnings] = useState<FinancialSummary | null>(null)
  const [unread, setUnread] = useState(0)
  const [error, setError] = useState('')
  const [locationOnline, setLocationOnline] = useState(false)
  const load = useCallback(() => Promise.all([
    api.get<ServiceRequest[]>('/v1/service-requests/my-assigned'),
    api.get<FinancialSummary>('/v1/technicians/me/earnings'),
    api.get<UnreadCount>('/v1/notifications/unread-count'),
  ]).then(([services, summary, count]) => {
    setRequests(services.data)
    setEarnings(summary.data)
    setUnread(count.data.count)
  }).catch((reason) => setError(message(reason))), [])
  usePolling(load, 10_000)

  useEffect(() => {
    if (!locationOnline) return
    let active = true
    const send = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync()
        if (!permission.granted || !active) return
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        await api.put('/v1/technicians/me/location', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          heading: location.coords.heading,
          online: true,
        })
      } catch (reason) { if (active) setError(message(reason)) }
    }
    void send()
    const interval = setInterval(() => void send(), 10_000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [locationOnline])

  async function toggleLocation() {
    if (!locationOnline) {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) { setError('Debes permitir la ubicación'); return }
      setLocationOnline(true)
      return
    }
    setLocationOnline(false)
    try {
      const location = await Location.getLastKnownPositionAsync()
      if (location) await api.put('/v1/technicians/me/location', {
        latitude: location.coords.latitude, longitude: location.coords.longitude, online: false,
      })
    } catch (reason) { setError(message(reason)) }
  }

  async function advance(item: ServiceRequest) {
    const next: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY',
      ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
    }
    if (!next[item.status]) return
    try {
      await api.put(`/v1/service-requests/${item.id}/status`, { status: next[item.status] })
      load()
    } catch (reason) { setError(message(reason)) }
  }

  return <Screen><Text style={styles.title}>Panel técnico</Text><Text style={styles.subtitle}>Gestiona tu perfil y servicios.</Text>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
      <View style={{ flex: 1 }}><Button title="Mi perfil" onPress={() => navigation.navigate('TechnicianProfile')} /></View>
      <View style={{ flex: 1 }}><Button title="Disponibles" onPress={() => navigation.navigate('AvailableRequests')} /></View>
    </View>
    <Button title={`Notificaciones${unread > 0 ? ` (${unread})` : ''}`} onPress={() => navigation.navigate('Notifications')} />
    <Button title={locationOnline ? 'Ubicación activa · Desactivar' : 'Activar ubicación'} onPress={toggleLocation} />
    <Button title="Mi cuenta / cerrar sesión" onPress={() => navigation.navigate('Profile')} />
    {!!error && <Text style={styles.error}>{error}</Text>}
    {earnings && <Card><Text style={styles.cardTitle}>Mis ganancias</Text><Text style={[styles.title, { color: colors.brand }]}>${earnings.totalTechnicianAmount.toLocaleString()}</Text><Text style={styles.muted}>{earnings.paymentCount} pagos · comisión de plataforma ${earnings.totalPlatformFee.toLocaleString()}</Text></Card>}
    <Text style={styles.label}>Servicios asignados</Text>
    <FlatList data={requests} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.muted}>No tienes servicios asignados.</Text>} renderItem={({ item }) => <Card>
      <Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.muted}>{item.clientName} · {item.address}</Text><Text style={[styles.muted, { color: colors.brand }]}>{item.status}</Text>
      {item.status === 'QUOTE_ACCEPTED' && <Button title="Voy en camino" onPress={() => advance(item)} />}
      {item.status === 'ON_THE_WAY' && <Button title="Ya llegué" onPress={() => advance(item)} />}
      {item.status === 'ARRIVED' && <Button title="Iniciar servicio" onPress={() => advance(item)} />}
      {item.status === 'IN_PROGRESS' && <Button title="Completar servicio" onPress={() => advance(item)} />}
      {item.status === 'PAID' && <Button title="Calificar cliente" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}
      <Button title="Abrir chat" onPress={() => navigation.navigate('Chat', { requestId: item.id })} />
    </Card>} />
  </Screen>
}

const empty = { documentNumber: '', phone: '', categoryIds: [] as string[], description: '', profilePhotoUrl: '', documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '', latitude: '', longitude: '', homeAddress: '', homeLatitude: '', homeLongitude: '', homeCity: '', homeNeighborhood: '' }

export function TechnicianProfileScreen() {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get<Category[]>('/v1/service-categories').then(({ data }) => setCategories(data))
    api.get<TechnicianProfile>('/v1/technicians/me').then(({ data }) => {
      setProfile(data)
      setForm({ documentNumber: data.documentNumber, phone: data.phone, categoryIds: data.categories.map((item) => item.id), description: data.description, profilePhotoUrl: data.profilePhotoUrl ?? '', documentPhotoUrl: data.documentPhotoUrl, certificatePhotoUrl: data.certificatePhotoUrl ?? '', workExperienceDescription: data.workExperienceDescription, latitude: String(data.latitude ?? ''), longitude: String(data.longitude ?? ''), homeAddress: data.homeAddress ?? '', homeLatitude: String(data.homeLatitude ?? ''), homeLongitude: String(data.homeLongitude ?? ''), homeCity: data.homeCity ?? '', homeNeighborhood: data.homeNeighborhood ?? '' })
    }).catch((reason) => { if (!axios.isAxiosError(reason) || reason.response?.status !== 404) setError(message(reason)) })
  }, [])

  async function save() {
    setError('')
    if (!form.latitude || !form.longitude || !form.homeAddress || !form.homeLatitude || !form.homeLongitude || !form.documentPhotoUrl || !form.workExperienceDescription.trim()) {
      setError('Completa domicilio, ubicación, documento y experiencia laboral')
      return
    }
    setLoading(true)
    const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), homeLatitude: Number(form.homeLatitude), homeLongitude: Number(form.homeLongitude) }
    try {
      const { data } = profile
        ? await api.put<TechnicianProfile>('/v1/technicians/me', payload)
        : await api.post<TechnicianProfile>('/v1/technicians/profile', payload)
      setProfile(data)
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  async function useGps() {
    setLocating(true); setError('')
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) {
        setError('Debes permitir el acceso a la ubicación')
        return
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setForm({
        ...form,
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
        homeLatitude: String(location.coords.latitude),
        homeLongitude: String(location.coords.longitude),
      })
    } catch {
      setError('No fue posible obtener la ubicación. Revisa que el GPS esté activo.')
    } finally {
      setLocating(false)
    }
  }

  const identityStatus = profile?.verificationStatus === 'VERIFIED'
    ? 'Identidad verificada'
    : profile?.verificationStatus === 'PENDING_VERIFICATION'
      ? 'Documento pendiente de verificación'
      : 'Completa el documento para iniciar la verificación'
  return <Screen><ScrollView><Text style={styles.title}>Perfil técnico</Text><Text style={styles.subtitle}>{profile ? `Estado profesional: ${profile.status} · ${identityStatus}` : 'Completa tus datos para solicitar aprobación.'}</Text>
    <Field placeholder="Documento" value={form.documentNumber} onChangeText={(documentNumber) => setForm({ ...form, documentNumber })} />
    <Field placeholder="Teléfono" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
    <Text style={styles.label}>Categorías</Text>{categories.map((category) => <Pressable key={category.id} onPress={() => setForm({ ...form, categoryIds: form.categoryIds.includes(category.id) ? form.categoryIds.filter((id) => id !== category.id) : [...form.categoryIds, category.id] })}><Card><Text style={[styles.cardTitle, form.categoryIds.includes(category.id) && { color: colors.brand }]}>{form.categoryIds.includes(category.id) ? '✓ ' : ''}{category.name}</Text></Card></Pressable>)}
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
    <Button title="Usar mi ubicación GPS" onPress={useGps} loading={locating} />
    {!!error && <Text style={styles.error}>{error}</Text>}<Button title={profile ? 'Actualizar perfil' : 'Crear perfil'} onPress={save} loading={loading} /><LoadingOverlay visible={loading} />
  </ScrollView></Screen>
}

export function AvailableRequestsScreen() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [error, setError] = useState('')
  const [radiusKm, setRadiusKm] = useState('10')
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [quoteDescriptions, setQuoteDescriptions] = useState<Record<string, string>>({})
  const [quoting, setQuoting] = useState<string | null>(null)
  const load = useCallback(() => api.get<ServiceRequest[]>(`/v1/service-requests/available?radiusKm=${radiusKm}`)
    .then(({ data }) => setRequests(data)).catch((reason) => setError(message(reason))), [radiusKm])
  usePolling(load, 10_000)
  async function quote(id: string) {
    setQuoting(id); setError('')
    try {
      await api.put(`/v1/service-requests/${id}/quote`, {
        technicianPrice: Number(quotes[id]),
        description: quoteDescriptions[id] || undefined,
      })
      load()
    } catch (reason) {
      setError(axios.isAxiosError(reason) && reason.response?.status === 409
        ? 'Ya tienes una cotización pendiente para este servicio. Espera respuesta o expiración.'
        : message(reason))
    } finally { setQuoting(null) }
  }
  return <Screen><Text style={styles.title}>Solicitudes cercanas</Text><Text style={styles.subtitle}>Solo visibles para técnicos aprobados y dentro del radio.</Text><Field keyboardType="numeric" placeholder="Radio en km" value={radiusKm} onChangeText={setRadiusKm} /><Button title="Buscar" onPress={load} />{!!error && <Text style={styles.error}>{error}</Text>}<FlatList data={requests} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.muted}>No hay solicitudes cercanas.</Text>} renderItem={({ item }) => <Card>{item.firstServiceImageUrl && <Image source={{ uri: item.firstServiceImageUrl }} style={{ width: '100%', height: 160, borderRadius: 12 }} />}<Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {item.clientAverageRating.toFixed(1)} · {item.clientPaidServicesCount} servicios pagados</Text><Text style={styles.muted}>{item.description}</Text>{item.images?.length > 0 && <ScrollView horizontal>{item.images.map((image) => <Image key={image.id} source={{ uri: image.imageUrl }} style={{ width: 120, height: 90, borderRadius: 10, marginRight: 8, marginTop: 8 }} />)}</ScrollView>}{item.estimatedPrice != null && <Text style={[styles.muted, { color: colors.brand }]}>Estimado del cliente: ${item.estimatedPrice.toLocaleString()}</Text>}<Text style={styles.muted}>{item.address} · {item.distanceKm?.toFixed(2)} km</Text><Field keyboardType="numeric" placeholder="Tu cotización" value={quotes[item.id] ?? ''} onChangeText={(value) => setQuotes({ ...quotes, [item.id]: value })} /><Field placeholder="Descripción de la oferta (opcional)" value={quoteDescriptions[item.id] ?? ''} onChangeText={(value) => setQuoteDescriptions({ ...quoteDescriptions, [item.id]: value })} /><Button title="Enviar cotización" onPress={() => quote(item.id)} loading={quoting === item.id} /></Card>} /><LoadingOverlay visible={quoting !== null} /></Screen>
}
