import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useAssignedRequestHistory, useClientRequestHistory } from '../hooks'
import { requestStatusLabels } from '../status'

export function ClientRequestHistoryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RequestHistory'>) {
  const requests = useClientRequestHistory()
  return <HistoryList
    title="Historial de solicitudes"
    requests={requests}
    onOpen={(request) => navigation.navigate('RequestDetail', { request })}
  />
}

export function TechnicianRequestHistoryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianHistory'>) {
  const requests = useAssignedRequestHistory()
  return <HistoryList
    title="Historial de servicios"
    requests={requests}
    onOpen={(request) => navigation.navigate('NotificationRequest', { requestId: request.id })}
  />
}

function HistoryList({ title, requests, onOpen }: {
  title: string
  requests: ReturnType<typeof useClientRequestHistory>
  onOpen: (request: NonNullable<ReturnType<typeof useClientRequestHistory>['data']>[number]) => void
}) {
  const { width } = useWindowDimensions()
  const cardWidth = width >= 700 ? '48.5%' : '100%'
  return <KeyboardAwareScreen>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>Servicios pagados o cancelados.</Text>
    <QueryState pending={requests.isPending} error={requests.error} empty={requests.data?.length === 0} emptyText="Aún no hay servicios en el historial.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {requests.data?.map((item) => <Pressable key={item.id} style={{ width: cardWidth }} onPress={() => onOpen(item)}>
          <Card style={{ height: '100%' }}>
            <Text style={styles.cardTitle}>{item.categoryName}</Text>
            <Text style={styles.muted}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={[styles.muted, { color: colors.brand }]}>{requestStatusLabels[item.status]}</Text>
            {item.finalPrice != null && <Text style={styles.cardTitle}>${item.finalPrice.toLocaleString()}</Text>}
          </Card>
        </Pressable>)}
      </View>
    </QueryState>
  </KeyboardAwareScreen>
}
