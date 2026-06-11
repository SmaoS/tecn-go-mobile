import { useState } from 'react'
import { Image, ScrollView, Text } from 'react-native'
import { Button, Card, Field, LoadingOverlay, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage, hasApiStatus } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import { useAvailableRequests } from '../../service-requests/hooks'
import { useSendQuote } from '../hooks'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../types'

export function AvailableRequestsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AvailableRequests'>) {
  const [radiusKm, setRadiusKm] = useState('10')
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const requests = useAvailableRequests(radiusKm)
  const quote = useSendQuote(radiusKm)
  const error = quote.error && hasApiStatus(quote.error, 409)
    ? 'Ya tienes una cotización pendiente para este servicio. Espera respuesta o expiración.'
    : quote.error ? apiMessage(quote.error) : ''
  return <KeyboardAwareScreen><Text style={styles.title}>Solicitudes cercanas</Text><Text style={styles.subtitle}>Solo visibles para técnicos aprobados y dentro del radio.</Text><Button title="Mi panel y servicios asignados" onPress={() => navigation.navigate('TechnicianHome')} /><Field keyboardType="numeric" placeholder="Radio en km" value={radiusKm} onChangeText={setRadiusKm} /><Button title="Buscar" onPress={() => void requests.refetch()} />{error && <Text style={styles.error}>{error}</Text>}
    <QueryState pending={requests.isPending} error={requests.error} empty={requests.data?.length === 0} emptyText="No hay solicitudes cercanas.">
      <>{requests.data?.map((item) => <Card key={item.id}>{item.firstServiceImageUrl && <Image source={{ uri: item.firstServiceImageUrl }} style={{ width: '100%', height: 160, borderRadius: 12 }} />}<Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.cardTitle}>{item.clientName}</Text>{item.clientProfilePhotoUrl && <Image source={{ uri: item.clientProfilePhotoUrl }} style={{ width: 58, height: 58, borderRadius: 29, marginTop: 8 }} />}<Text style={[styles.muted, { color: colors.brand }]}>★ {item.clientAverageRating.toFixed(1)} · {item.clientPaidServicesCount} servicios pagados</Text><Text style={styles.muted}>{item.description}</Text>{item.images?.length > 0 && <ScrollView horizontal keyboardShouldPersistTaps="handled">{item.images.map((image) => <Image key={image.id} source={{ uri: image.imageUrl }} style={{ width: 120, height: 90, borderRadius: 10, marginRight: 8, marginTop: 8 }} />)}</ScrollView>}{item.estimatedPrice != null && <Text style={[styles.muted, { color: colors.brand }]}>Estimado del cliente: ${item.estimatedPrice.toLocaleString()}</Text>}<Text style={styles.muted}>{item.address} · {item.distanceKm?.toFixed(2)} km</Text><Field keyboardType="numeric" placeholder="Tu cotización" value={quotes[item.id] ?? ''} onChangeText={(value) => setQuotes({ ...quotes, [item.id]: value })} /><Field placeholder="Descripción de la oferta (opcional)" value={descriptions[item.id] ?? ''} onChangeText={(value) => setDescriptions({ ...descriptions, [item.id]: value })} /><Button title="Enviar cotización" onPress={() => quote.mutate({ id: item.id, price: Number(quotes[item.id]), description: descriptions[item.id] || undefined })} loading={quote.isPending} /></Card>)}</>
    </QueryState><LoadingOverlay visible={quote.isPending} />
  </KeyboardAwareScreen>
}
