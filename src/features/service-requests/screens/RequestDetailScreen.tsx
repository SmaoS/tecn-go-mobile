import { Image, ScrollView, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Screen, colors, styles } from '../../../components/UI'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { serviceRequestApi } from '../api'
import { Tracking } from '../components/Tracking'
import { useRequestAction, useRequestDetail, useRequestQuotes, useTechnicianLocation } from '../hooks'

export function RequestDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'RequestDetail'>) {
  const request = useRequestDetail(route.params.request)
  const item = request.data
  const quotes = useRequestQuotes(route.params.request.id)
  const location = useTechnicianLocation(item)
  const action = useRequestAction(item.id)

  return <Screen><QueryState pending={request.isPending || quotes.isPending} error={request.error ?? quotes.error}>
    <Text style={styles.title}>{item.categoryName}</Text><Card><Text style={styles.cardTitle}>{item.status}</Text><Text style={styles.muted}>{item.description}</Text><Text style={styles.muted}>{item.address}</Text></Card>
    {item.images?.length > 0 && <ScrollView horizontal>{item.images.map((image) => <Image key={image.id} source={{ uri: image.imageUrl }} style={{ width: 180, height: 130, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    <Tracking status={item.status} />
    {item.status === 'CANCELLED' && <Text style={styles.error}>Servicio cancelado</Text>}
    {item.estimatedPrice != null && <Text style={styles.muted}>Estimado: ${item.estimatedPrice.toLocaleString()}</Text>}
    {item.technicianPrice != null && <Text style={[styles.muted, { color: colors.brand }]}>Cotización aceptada: ${item.technicianPrice.toLocaleString()}</Text>}
    {item.status === 'QUOTE_PENDING' && quotes.data?.filter((quote) => quote.status === 'PENDING').map((quote) => <Card key={quote.id}><Text style={styles.cardTitle}>{quote.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {quote.technicianAverageRating.toFixed(1)} · {quote.technicianCompletedServicesCount} servicios</Text><Text style={styles.muted}>{quote.technicianCategories.join(', ')}</Text><Text style={styles.muted}>{quote.technicianExperienceDescription}</Text>{quote.description && <Text style={styles.muted}>{quote.description}</Text>}<Text style={styles.muted}>Expira: {new Date(quote.expiresAt).toLocaleString()}</Text><Text style={[styles.cardTitle, { color: colors.brand }]}>${quote.price.toLocaleString()}</Text><Button title="Aceptar esta cotización" onPress={() => action.mutate(() => serviceRequestApi.confirmQuote(item.id, quote.id))} loading={action.isPending} /><Button title="Rechazar cotización" onPress={() => action.mutate(() => serviceRequestApi.rejectQuote(item.id, quote.id))} loading={action.isPending} /></Card>)}
    {item.technicianName && <Card><Text style={styles.cardTitle}>{item.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {(item.technicianAverageRating ?? 5).toFixed(1)} · {item.technicianCompletedServicesCount} servicios</Text><Text style={styles.muted}>{item.technicianExperienceDescription}</Text><Text style={styles.muted}>{item.technicianCategories?.join(', ')}</Text></Card>}
    {item.finalPrice != null && <Text style={styles.label}>Precio final: ${item.finalPrice.toLocaleString()}</Text>}
    {location.data && <Card><Text style={styles.cardTitle}>{location.data.online ? 'Técnico en línea' : 'Última ubicación'}</Text><Text style={styles.muted}>{location.data.latitude.toFixed(6)}, {location.data.longitude.toFixed(6)}</Text><Text style={styles.muted}>{new Date(location.data.updatedAt).toLocaleString()}</Text></Card>}
    {action.error && <Text style={styles.error}>{apiMessage(action.error)}</Text>}
    {!['COMPLETED', 'PAID', 'CANCELLED'].includes(item.status) && <Button title="Cancelar solicitud" onPress={() => action.mutate(() => serviceRequestApi.status(item.id, 'CANCELLED'))} loading={action.isPending} />}
    {item.technicianId && <Button title="Abrir chat" onPress={() => navigation.navigate('Chat', { requestId: item.id })} />}
    {item.status === 'COMPLETED' && <Button title="Confirmar pago en efectivo" onPress={() => action.mutate(() => serviceRequestApi.payCash(item.id))} loading={action.isPending} />}
    {item.status === 'PAID' && <Button title="Calificar servicio" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}
  </QueryState></Screen>
}
