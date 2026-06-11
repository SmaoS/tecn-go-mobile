import { useCallback, useEffect, useState } from 'react'
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native'
import * as Location from 'expo-location'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { api } from '../api/client'
import { Button, Card, Field, LoadingOverlay, Screen, colors, styles } from '../components/UI'
import { NearbyMap } from '../components/NearbyMap'
import type { Category, ChatMessage, RequestStatus, RootStackParamList, ServiceQuote, ServiceRequest, Session, TechnicianLocation, UnreadCount, UserNotification, UserProfile } from '../types'
import { pickAndUploadEvidence, pickAndUploadImage, pickServiceImages, uploadServiceImage } from '../services/files'
import { usePolling } from '../hooks/usePolling'

type NavProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>

export function HomeScreen({ navigation }: NavProps<'Home'>) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [unread, setUnread] = useState(0)
  const load = useCallback(async () => {
    try {
      const [services, count] = await Promise.all([
        api.get<ServiceRequest[]>('/v1/service-requests/my'),
        api.get<UnreadCount>('/v1/notifications/unread-count'),
      ])
      setRequests(services.data)
      setUnread(count.data.count)
    } catch {
      setRequests([])
    }
  }, [])
  usePolling(load, 10_000)
  return <Screen><Text style={styles.title}>¿Qué necesitas?</Text><Text style={styles.subtitle}>Encuentra ayuda técnica confiable.</Text>
    <Button title="Solicitar servicio" onPress={() => navigation.navigate('RequestService')} />
    <View style={{ flexDirection: 'row', gap: 8, marginVertical: 16 }}>
      <Pressable onPress={() => navigation.navigate('NearbyTechnicians')}><Text style={styles.link}>Técnicos cercanos</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Profile')}><Text style={styles.link}>Mi perfil</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Notifications')}><Text style={styles.link}>Notificaciones{unread > 0 ? ` (${unread})` : ''}</Text></Pressable>
    </View>
    <Text style={styles.label}>Solicitudes recientes</Text>
    <FlatList data={requests} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.muted}>Aún no tienes solicitudes.</Text>} renderItem={({ item }) => <Pressable onPress={() => navigation.navigate('RequestDetail', { request: item })}><Card><Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.muted}>{item.description}</Text><Text style={[styles.muted, { color: colors.brand }]}>{item.status}</Text></Card></Pressable>} />
  </Screen>
}

export function RequestServiceScreen({ navigation }: NavProps<'RequestService'>) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<{ uri: string; name: string; mimeType: string }[]>([])
  useEffect(() => { api.get<Category[]>('/v1/services').then(({ data }) => setCategories(data)) }, [])
  async function useGps() {
    setError('')
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted) { setError('Permiso de ubicación denegado'); return }
    const location = await Location.getCurrentPositionAsync({})
    setLatitude(String(location.coords.latitude))
    setLongitude(String(location.coords.longitude))
  }
  async function submit() {
    if (!selected || !description || !address || !latitude || !longitude) return
    setLoading(true)
    try {
      const { data } = await api.post<ServiceRequest>('/v1/service-requests', { categoryId: selected, description, address,
        latitude: Number(latitude), longitude: Number(longitude),
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : null })
      for (const image of images) await uploadServiceImage(data.id, image)
      navigation.replace('Home')
    } catch { setError('No fue posible crear la solicitud') } finally { setLoading(false) }
  }
  return <Screen><ScrollView><Text style={styles.title}>Nuevo servicio</Text><Text style={styles.label}>Categoría</Text>
    {categories.map((item) => <Pressable key={item.id} onPress={() => setSelected(item.id)}><Card><Text style={[styles.cardTitle, selected === item.id && { color: colors.brand }]}>{item.name}</Text><Text style={styles.muted}>{item.description}</Text></Card></Pressable>)}
    <Field multiline placeholder="Describe el problema" value={description} onChangeText={setDescription} />
    <Field placeholder="Dirección" value={address} onChangeText={setAddress} />
    <Field keyboardType="numeric" placeholder="Latitud" value={latitude} onChangeText={setLatitude} />
    <Field keyboardType="numeric" placeholder="Longitud" value={longitude} onChangeText={setLongitude} />
    <Button title="Usar ubicación GPS" onPress={useGps} />
    <Field keyboardType="numeric" placeholder="Presupuesto estimado (opcional)" value={estimatedPrice} onChangeText={setEstimatedPrice} />
    <Button title={images.length ? `${images.length} imágenes seleccionadas` : 'Subir imágenes opcionales'} onPress={async () => setImages(await pickServiceImages())} />
    {images.length > 0 && <ScrollView horizontal>{images.map((image) => <Image key={image.uri} source={{ uri: image.uri }} style={{ width: 100, height: 100, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Button title="Crear solicitud" onPress={submit} loading={loading} /><LoadingOverlay visible={loading} /></ScrollView>
  </Screen>
}

export function NearbyTechniciansScreen() {
  return <Screen><Text style={styles.title}>Técnicos cercanos</Text><Text style={styles.subtitle}>Vista preparada para conectar geolocalización real.</Text>
    <NearbyMap />
  </Screen>
}

export function RequestDetailScreen({ route, navigation }: NavProps<'RequestDetail'>) {
  const [item, setItem] = useState(route.params.request)
  const [quotes, setQuotes] = useState<ServiceQuote[]>([])
  const [error, setError] = useState('')
  const [technicianLocation, setTechnicianLocation] = useState<TechnicianLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const load = useCallback(async () => {
    const [mine, offers] = await Promise.all([
      api.get<ServiceRequest[]>('/v1/service-requests/my'),
      api.get<ServiceQuote[]>(`/v1/service-requests/${item.id}/quotes`),
    ])
    const updated = mine.data.find((request) => request.id === item.id)
    if (updated) setItem(updated)
    setQuotes(offers.data)
    if (updated?.technicianId && ['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(updated.status)) {
      api.get<TechnicianLocation>(`/v1/service-requests/${item.id}/technician-location`)
        .then(({ data }) => setTechnicianLocation(data)).catch(() => setTechnicianLocation(null))
    }
  }, [item.id])
  usePolling(load, 10_000)
  async function cancel() {
    setError('')
    try {
      const { data } = await api.put<ServiceRequest>(`/v1/service-requests/${item.id}/status`, { status: 'CANCELLED' })
      setItem(data)
    } catch { setError('No fue posible actualizar la solicitud') }
  }
  async function confirmQuote(quoteId: string) {
    setError(''); setLoading(true)
    try {
      const { data } = await api.put<ServiceRequest>(`/v1/service-requests/${item.id}/confirm-quote`, { quoteId })
      setItem(data)
      setQuotes((current) => current.map((quote) => ({
        ...quote,
        status: quote.id === quoteId ? 'ACCEPTED' : 'REJECTED',
      })))
    } catch { setError('No fue posible confirmar la cotización') } finally { setLoading(false) }
  }
  async function rejectQuote(quoteId: string) {
    setLoading(true); setError('')
    try { await api.put(`/v1/service-requests/${item.id}/quotes/${quoteId}/reject`); await load() }
    catch { setError('No fue posible rechazar la cotización') } finally { setLoading(false) }
  }
  async function payCash() {
    setError('')
    try {
      await api.post(`/v1/service-requests/${item.id}/payment/cash`)
      setItem({ ...item, status: 'PAID' })
    } catch { setError('No fue posible confirmar el pago en efectivo') }
  }
  return <Screen><Text style={styles.title}>{item.categoryName}</Text><Card><Text style={styles.cardTitle}>{item.status}</Text><Text style={styles.muted}>{item.description}</Text><Text style={styles.muted}>{item.address}</Text></Card>
    {item.images?.length > 0 && <ScrollView horizontal>{item.images.map((image) => <Image key={image.id} source={{ uri: image.imageUrl }} style={{ width: 180, height: 130, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    <Tracking status={item.status} />
    {item.estimatedPrice != null && <Text style={styles.muted}>Estimado: ${item.estimatedPrice.toLocaleString()}</Text>}
    {item.technicianPrice != null && <Text style={[styles.muted, { color: colors.brand }]}>Cotización aceptada: ${item.technicianPrice.toLocaleString()}</Text>}
    {item.status === 'QUOTE_PENDING' && quotes.filter((quote) => quote.status === 'PENDING').map((quote) => <Card key={quote.id}><Text style={styles.cardTitle}>{quote.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {quote.technicianAverageRating.toFixed(1)} · {quote.technicianCompletedServicesCount} servicios</Text><Text style={styles.muted}>{quote.technicianCategories.join(', ')}</Text><Text style={styles.muted}>{quote.technicianExperienceDescription}</Text>{quote.description && <Text style={styles.muted}>{quote.description}</Text>}<Text style={styles.muted}>Expira: {new Date(quote.expiresAt).toLocaleString()}</Text><Text style={[styles.cardTitle, { color: colors.brand }]}>${quote.price.toLocaleString()}</Text><Button title="Aceptar esta cotización" onPress={() => confirmQuote(quote.id)} loading={loading} /><Button title="Rechazar cotización" onPress={() => rejectQuote(quote.id)} loading={loading} /></Card>)}
    {item.technicianName && <Card><Text style={styles.cardTitle}>{item.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {(item.technicianAverageRating ?? 5).toFixed(1)} · {item.technicianCompletedServicesCount} servicios</Text><Text style={styles.muted}>{item.technicianExperienceDescription}</Text><Text style={styles.muted}>{item.technicianCategories?.join(', ')}</Text></Card>}
    {item.finalPrice != null && <Text style={styles.label}>Precio final: ${item.finalPrice.toLocaleString()}</Text>}
    {technicianLocation && <Card><Text style={styles.cardTitle}>{technicianLocation.online ? 'Técnico en línea' : 'Última ubicación'}</Text><Text style={styles.muted}>{technicianLocation.latitude.toFixed(6)}, {technicianLocation.longitude.toFixed(6)}</Text><Text style={styles.muted}>{new Date(technicianLocation.updatedAt).toLocaleString()}</Text></Card>}
    {!!error && <Text style={styles.error}>{error}</Text>}
    {!['COMPLETED', 'PAID', 'CANCELLED'].includes(item.status) && <Button title="Cancelar solicitud" onPress={cancel} />}
    {item.technicianId && <Button title="Abrir chat" onPress={() => navigation.navigate('Chat', { requestId: item.id })} />}
    {item.status === 'COMPLETED' && <Button title="Confirmar pago en efectivo" onPress={payCash} />}
    {item.status === 'PAID' && <Button title="Calificar servicio" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}<LoadingOverlay visible={loading} />
  </Screen>
}

export function ChatScreen({ route }: NavProps<'Chat'>) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    const { data } = await api.get<ChatMessage[]>(`/v1/service-requests/${route.params.requestId}/chat`)
    setMessages(data)
    await api.put(`/v1/service-requests/${route.params.requestId}/chat/read`)
  }, [route.params.requestId])
  usePolling(load, 5_000)
  async function send() {
    if (!message.trim()) return
    await api.post(`/v1/service-requests/${route.params.requestId}/chat/messages`, { message })
    setMessage('')
    await load()
  }
  return <Screen><Text style={styles.title}>Chat</Text><FlatList style={{ flex: 1 }} data={messages} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.muted}>Inicia la conversación.</Text>} renderItem={({ item }) => <Card><Text style={styles.cardTitle}>{item.senderName}</Text><Text style={styles.muted}>{item.message}</Text></Card>} /><Field placeholder="Escribe un mensaje" value={message} onChangeText={setMessage} /><Button title="Enviar" onPress={send} /></Screen>
}

export function NotificationsScreen() {
  const [items, setItems] = useState<UserNotification[]>([])
  const load = useCallback(() => api.get<UserNotification[]>('/v1/notifications').then(({ data }) => setItems(data)), [])
  usePolling(load, 10_000)
  async function read(item: UserNotification) { if (!item.read) await api.put(`/v1/notifications/${item.id}/read`); await load() }
  return <Screen><Text style={styles.title}>Notificaciones</Text><FlatList data={items} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.muted}>No tienes notificaciones.</Text>} renderItem={({ item }) => <Pressable onPress={() => read(item)}><Card><Text style={[styles.cardTitle, item.read && { color: colors.muted }]}>{item.title}{item.read ? '' : ' · Nueva'}</Text><Text style={styles.muted}>{item.message}</Text><Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text></Card></Pressable>} /></Screen>
}

const trackingSteps: RequestStatus[] = ['QUOTE_PENDING', 'QUOTED', 'QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID']
function Tracking({ status }: { status: RequestStatus }) {
  if (status === 'CANCELLED') return <Text style={styles.error}>Servicio cancelado</Text>
  const current = trackingSteps.indexOf(status)
  return <View style={{ flexDirection: 'row', gap: 4, marginBottom: 16 }}>{trackingSteps.map((step, index) => <View key={step} style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: index <= current ? colors.brand : colors.border }} />)}</View>
}

export function RatingScreen({ route, navigation }: NavProps<'Rating'>) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit() {
    setLoading(true); setError('')
    try {
      await api.post(`/v1/service-requests/${route.params.requestId}/ratings`, { score: rating, comment })
      navigation.popToTop()
    } catch { setError('No fue posible enviar la calificación') } finally { setLoading(false) }
  }
  return <Screen><Text style={styles.title}>Califica el servicio</Text><Text style={styles.subtitle}>Tu opinión ayuda a construir confianza.</Text><View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Text style={{ color: value <= rating ? colors.brand : colors.muted, fontSize: 34 }}>★</Text></Pressable>)}</View><Field multiline placeholder="Cuéntanos cómo fue la experiencia" value={comment} onChangeText={setComment} />{!!error && <Text style={styles.error}>{error}</Text>}<Button title="Enviar calificación" onPress={submit} loading={loading} /></Screen>
}

export function ProfileScreen({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { api.get<UserProfile>('/v1/users/me/profile').then(({ data }) => setProfile(data)).catch(() => setError('No fue posible cargar el perfil')) }, [])
  async function save() {
    if (!profile?.documentPhotoUrl) { setError('El documento es obligatorio'); return }
    setLoading(true)
    try { setProfile((await api.put<UserProfile>('/v1/users/me/profile', profile)).data) } catch { setError('No fue posible guardar el perfil') } finally { setLoading(false) }
  }
  async function useHomeGps() {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (!permission.granted || !profile) return
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    setProfile({ ...profile, homeLatitude: location.coords.latitude, homeLongitude: location.coords.longitude })
  }
  async function sendEmailVerification() {
    try {
      await api.post('/v1/auth/send-email-verification')
      setError('Correo de verificación enviado')
    } catch { setError('No fue posible enviar el correo') }
  }
  const verificationLabel = profile?.verificationStatus === 'VERIFIED'
    ? 'Identidad verificada'
    : profile?.verificationStatus === 'PENDING_VERIFICATION'
      ? 'Documento pendiente de verificación'
      : 'Carga tu documento para iniciar la verificación'
  return <Screen><ScrollView><Text style={styles.title}>Mi perfil</Text><Card><Text style={styles.cardTitle}>{session.email}</Text><Text style={[styles.muted, { color: colors.brand }]}>{verificationLabel}</Text><Text style={styles.muted}>Correo: {profile?.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {profile?.documentsVerified ? 'verificados' : 'pendientes'}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {profile?.averageRating.toFixed(1) ?? '5.0'} · {profile?.paidServicesCount ?? 0} servicios pagados</Text></Card>{profile && <><Field placeholder="Nombre completo" value={profile.fullName} onChangeText={(fullName) => setProfile({ ...profile, fullName })} /><Field placeholder="Teléfono" value={profile.phone ?? ''} onChangeText={(phone) => setProfile({ ...profile, phone })} /><Field placeholder="Dirección domicilio" value={profile.homeAddress ?? ''} onChangeText={(homeAddress) => setProfile({ ...profile, homeAddress })} /><Field placeholder="Ciudad" value={profile.homeCity ?? ''} onChangeText={(homeCity) => setProfile({ ...profile, homeCity })} /><Field placeholder="Barrio" value={profile.homeNeighborhood ?? ''} onChangeText={(homeNeighborhood) => setProfile({ ...profile, homeNeighborhood })} /><Field keyboardType="numeric" placeholder="Latitud domicilio" value={String(profile.homeLatitude ?? '')} onChangeText={(value) => setProfile({ ...profile, homeLatitude: Number(value) })} /><Field keyboardType="numeric" placeholder="Longitud domicilio" value={String(profile.homeLongitude ?? '')} onChangeText={(value) => setProfile({ ...profile, homeLongitude: Number(value) })} /><Button title="Usar ubicación actual" onPress={useHomeGps} /><Button title={profile.profilePhotoUrl ? 'Foto de perfil cargada' : 'Subir foto de perfil'} onPress={async () => setProfile({ ...profile, profilePhotoUrl: await pickAndUploadImage() ?? profile.profilePhotoUrl })} /><Button title={profile.documentPhotoUrl ? 'Documento cargado' : 'Subir documento obligatorio'} onPress={async () => setProfile({ ...profile, documentPhotoUrl: await pickAndUploadEvidence() ?? profile.documentPhotoUrl })} />{!!error && <Text style={styles.error}>{error}</Text>}<Button title="Guardar perfil" onPress={save} loading={loading} />{!profile.emailVerified && <Button title="Verificar correo" onPress={sendEmailVerification} />}</>}<Button title="Cerrar sesión" onPress={onLogout} /><LoadingOverlay visible={loading} /></ScrollView></Screen>
}
