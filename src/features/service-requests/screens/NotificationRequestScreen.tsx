import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, colors, Screen, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { requestStatusLabels } from '../status'
import { useNotificationRequest } from '../hooks'
import { useSession } from '../../../context/useSession'

export function NotificationRequestScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'NotificationRequest'>) {
  const request = useNotificationRequest(route.params.requestId)
  const item = request.data
  const { session } = useSession()

  return <Screen>
    <Text style={styles.title}>Detalle del servicio</Text>
    <QueryState pending={request.isPending} error={request.error}>
      {item && <Card>
        <Text style={styles.cardTitle}>{item.categoryName}</Text>
        <Text style={[styles.muted, { color: colors.brand }]}>{requestStatusLabels[item.status]}</Text>
        <Text style={styles.muted}>{item.description}</Text>
        <Text style={styles.muted}>{item.address}</Text>
        {item.finalPrice != null && <Text style={styles.cardTitle}>${item.finalPrice.toLocaleString()}</Text>}
        {session?.role === 'CLIENT' && <Button title="Ver solicitud y cotizaciones" onPress={() =>
          navigation.navigate('RequestDetail', { request: item })} />}
        {item.technicianId && <Button title="Abrir chat" onPress={() =>
          navigation.navigate('Chat', { requestId: item.id })} />}
        <Button title="Evidencias, pagos y soporte" onPress={() =>
          navigation.navigate('ServiceSupport', { requestId: item.id })} />
      </Card>}
    </QueryState>
  </Screen>
}
