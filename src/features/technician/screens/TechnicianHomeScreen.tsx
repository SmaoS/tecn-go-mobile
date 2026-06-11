import { useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Screen, colors, styles } from '../../../components/UI'
import { useUnreadNotifications } from '../../notifications/hooks'
import { useTechnicianEarnings } from '../../payments/hooks'
import { useAdvanceRequest, useAssignedRequests } from '../../service-requests/hooks'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RequestStatus, RootStackParamList, ServiceRequest } from '../../../types'
import { useTechnicianLocationTracking } from '../../location/hooks'

export function TechnicianHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianHome'>) {
  const tracking = useTechnicianLocationTracking()
  const requests = useAssignedRequests()
  const earnings = useTechnicianEarnings()
  const unread = useUnreadNotifications()
  const advance = useAdvanceRequest()

  function next(item: ServiceRequest) {
    const states: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED',
    }
    const status = states[item.status]
    if (status) advance.mutate({ requestId: item.id, status })
  }
  const actionLabels: Partial<Record<RequestStatus, string>> = {
    QUOTE_ACCEPTED: 'Voy en camino', ON_THE_WAY: 'Ya llegué',
    ARRIVED: 'Iniciar servicio', IN_PROGRESS: 'Completar servicio',
  }

  return <Screen><Text style={styles.title}>Panel técnico</Text><Text style={styles.subtitle}>Gestiona tu perfil y servicios.</Text>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}><View style={{ flex: 1 }}><Button title="Mi perfil" onPress={() => navigation.navigate('TechnicianProfile')} /></View><View style={{ flex: 1 }}><Button title="Disponibles" onPress={() => navigation.navigate('AvailableRequests')} /></View></View>
    <Button title={`Notificaciones${(unread.data ?? 0) > 0 ? ` (${unread.data})` : ''}`} onPress={() => navigation.navigate('Notifications')} />
    <Button title={tracking.online ? 'Ubicación activa · Desactivar' : 'Activar ubicación'} onPress={tracking.toggle} />
    <Button title="Mi cuenta / cerrar sesión" onPress={() => navigation.navigate('Profile')} />
    <Button title="Compromiso y términos" onPress={() => navigation.navigate('Legal')} />
    {(tracking.error || advance.error) && <Text style={styles.error}>{tracking.error || apiMessage(advance.error)}</Text>}
    <QueryState pending={earnings.isPending} error={earnings.error}>{earnings.data && <Card><Text style={styles.cardTitle}>Mis ganancias</Text><Text style={[styles.title, { color: colors.brand }]}>${earnings.data.totalTechnicianAmount.toLocaleString()}</Text><Text style={styles.muted}>{earnings.data.paymentCount} pagos · comisión de plataforma ${earnings.data.totalPlatformFee.toLocaleString()}</Text></Card>}</QueryState>
    <Text style={styles.label}>Servicios asignados</Text>
    <QueryState pending={requests.isPending} error={requests.error ?? unread.error} empty={requests.data?.length === 0} emptyText="No tienes servicios asignados.">
      <FlatList data={requests.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Card><Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.muted}>{item.clientName} · {item.address}</Text><Text style={[styles.muted, { color: colors.brand }]}>{item.status}</Text>
        {actionLabels[item.status] && <Button title={actionLabels[item.status]!} onPress={() => next(item)} loading={advance.isPending} />}
        {item.status === 'PAID' && <Button title="Calificar cliente" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}
        <Button title="Abrir chat" onPress={() => navigation.navigate('Chat', { requestId: item.id })} />
        <Button title="Evidencias, pagos y reportes" onPress={() => navigation.navigate('ServiceSupport', { requestId: item.id })} />
      </Card>} />
    </QueryState>
  </Screen>
}
