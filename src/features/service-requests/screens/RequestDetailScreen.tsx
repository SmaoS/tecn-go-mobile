import { useEffect, useRef } from 'react'
import { ScrollView, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { PrivateImage } from '../../../components/PrivateImage'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { Tracking } from '../components/Tracking'
import { useRequestAction, useRequestDetail, useRequestQuotes, useTechnicianLocation } from '../hooks'
import { useRatingStatus } from '../../ratings/hooks'
import { requestStatusLabels } from '../status'
import { paymentMethodLabels } from '../../payments/paymentMethods'
import { formatCopCurrency } from '../../../shared/format'

export function RequestDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'RequestDetail'>) {
  const request = useRequestDetail(route.params.request)
  const item = request.data
  const quotes = useRequestQuotes(route.params.request.id)
  const location = useTechnicianLocation(item)
  const action = useRequestAction(item.id)
  const ratingStatus = useRatingStatus(item.id, item.status === 'PAID')
  const openedRating = useRef(false)

  useEffect(() => {
    if (openedRating.current || item.status !== 'PAID' || !ratingStatus.data || ratingStatus.data.rated) return
    openedRating.current = true
    navigation.navigate('Rating', { requestId: item.id })
  }, [item.id, item.status, navigation, ratingStatus.data])

  return <KeyboardAwareScreen><QueryState pending={request.isPending || quotes.isPending} error={request.error ?? quotes.error ?? ratingStatus.error}>
    <Text style={styles.title}>{item.categoryName}</Text><Card><Text style={styles.cardTitle}>{requestStatusLabels[item.status]}</Text><Text style={styles.muted}>{item.description}</Text><Text style={styles.muted}>{item.address}</Text></Card>
    {item.images?.length > 0 && <ScrollView horizontal>{item.images.map((image) => <PrivateImage key={image.id} url={image.imageUrl} style={{ width: 180, height: 130, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    <Tracking status={item.status} />
    {item.status === 'CANCELLED' && <Text style={styles.error}>Servicio cancelado</Text>}
    {item.estimatedPrice != null && <Text style={styles.muted}>Estimado: {formatCopCurrency(item.estimatedPrice)}</Text>}
    <Text style={styles.muted}>Método de pago: {paymentMethodLabels[item.requestedPaymentMethod] ?? item.requestedPaymentMethod}</Text>
    {item.technicianPrice != null && <Text style={[styles.muted, { color: colors.brand }]}>Cotización aceptada: {formatCopCurrency(item.technicianPrice)}</Text>}
    {item.status === 'QUOTE_PENDING' && quotes.data?.filter((quote) => quote.status === 'PENDING').map((quote) => <Card key={quote.id}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>{quote.technicianProfilePhotoUrl && <PrivateImage url={quote.technicianProfilePhotoUrl} style={{ width: 58, height: 58, borderRadius: 29 }} />}<View style={{ flex: 1 }}><Text style={styles.cardTitle}>{quote.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {quote.technicianAverageRating.toFixed(1)} · {quote.technicianCompletedServicesCount} servicios</Text>{quote.certifiedTechnician && <Text style={{ color: colors.brand, fontWeight: '900', marginTop: 4 }}>✓ Certificado</Text>}</View></View><Text style={styles.muted}>{quote.technicianExperienceDescription}</Text>{quote.description && <Text style={styles.muted}>{quote.description}</Text>}<Text style={[styles.cardTitle, { color: colors.brand }]}>{formatCopCurrency(quote.price)}</Text><Button testID={`e2e.quote.accept.${quote.id}`} title="Aceptar esta cotización" onPress={() => action.mutate({ kind: 'confirmQuote', quoteId: quote.id })} loading={action.isPending} /><Button title="Rechazar cotización" onPress={() => action.mutate({ kind: 'rejectQuote', quoteId: quote.id })} loading={action.isPending} /></Card>)}
    {item.technicianName && <Card><Text style={styles.cardTitle}>{item.technicianName}</Text><Text style={[styles.muted, { color: colors.brand }]}>★ {(item.technicianAverageRating ?? 5).toFixed(1)} · {item.technicianCompletedServicesCount} servicios</Text>{item.certifiedTechnician && <Text style={{ color: colors.brand, fontWeight: '900', marginTop: 4 }}>✓ Certificado</Text>}<Text style={styles.muted}>{item.technicianExperienceDescription}</Text></Card>}
    {item.finalPrice != null && <Text style={styles.label}>Precio final: {formatCopCurrency(item.finalPrice)}</Text>}
    {location.data && <Card><Text style={styles.cardTitle}>{location.data.online ? 'Técnico en línea' : 'Última ubicación disponible'}</Text><Text style={styles.muted}>Ubicación protegida · actualizada {new Date(location.data.updatedAt).toLocaleString()}</Text></Card>}
    {action.error && <Text style={styles.error}>{apiMessage(action.error)}</Text>}
    {!['COMPLETED', 'PAID', 'CANCELLED'].includes(item.status) && <Button title="Cancelar solicitud" onPress={() => action.mutate({ kind: 'status', status: 'CANCELLED' })} loading={action.isPending} />}
    {item.technicianId && <Button title="Abrir chat" onPress={() => navigation.navigate('Chat', { requestId: item.id })} />}
    <Button title="Evidencias, pagos y reportes" onPress={() => navigation.navigate('ServiceSupport', { requestId: item.id })} />
    {item.status === 'COMPLETED' && <Card><Text style={styles.cardTitle}>Pendiente de cierre</Text><Text style={styles.muted}>El técnico debe confirmar si recibió el pago para cerrar el servicio. Después ambos podrán calificar o reportar un problema.</Text></Card>}
    {item.status === 'PAID' && ratingStatus.data && !ratingStatus.data.rated && <Button title="Calificar servicio" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}
  </QueryState></KeyboardAwareScreen>
}
