import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, colors } from '../../../components/UI'
import { useDoubleBackExit } from '../../../hooks/useDoubleBackExit'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RequestStatus, RootStackParamList, ServiceRequest } from '../../../types'
import { useUnreadNotifications } from '../../notifications/hooks'
import { useRatingStatuses } from '../../ratings/hooks'
import { useAdvanceRequest, useAssignedRequests } from '../../service-requests/hooks'
import { requestStatusLabels } from '../../service-requests/status'
import { TechnicianFooter } from '../components/TechnicianFooter'
import { TechnicianHeader } from '../components/TechnicianHeader'
import { TechnicianMenu } from '../components/TechnicianMenu'
import { useTechnicianAvailability, useTechnicianProfile } from '../hooks'
import { useSession } from '../../../context/useSession'
import { paymentMethodLabels } from '../../payments/paymentMethods'
import { showToast } from '../../../components/Toast'

export function TechnicianHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianHome'>) {
  useDoubleBackExit()
  const [menu, setMenu] = useState(false)
  const requests = useAssignedRequests()
  const unread = useUnreadNotifications()
  const advance = useAdvanceRequest()
  const profile = useTechnicianProfile()
  const availability = useTechnicianAvailability()
  const paidIds = (requests.data ?? []).filter((item) => item.status === 'PAID').map((item) => item.id)
  const ratingStatuses = useRatingStatuses(paidIds)
  const { logout, session, switchMode } = useSession()

  function next(item: ServiceRequest) {
    const states: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY',
      ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS',
    }
    if (item.status === 'IN_PROGRESS') {
      Alert.alert('Terminar trabajo', '¿El cliente pagó el valor acordado?', [
        { text: 'No, no pagó', style: 'destructive', onPress: () => advance.mutate({ requestId: item.id, paymentReceived: false, paymentMethod: item.requestedPaymentMethod, comment: 'El cliente no pagó el valor acordado.' }) },
        { text: 'Sí, pagó', onPress: () => advance.mutate({ requestId: item.id, paymentReceived: true, paymentMethod: item.requestedPaymentMethod }) },
        { text: 'Cancelar', style: 'cancel' },
      ])
      return
    }
    const status = states[item.status]
    if (status) advance.mutate({ requestId: item.id, status })
  }
  const actionLabels: Partial<Record<RequestStatus, string>> = {
    QUOTE_ACCEPTED: 'Voy en camino',
    ON_THE_WAY: 'Ya llegué',
    ARRIVED: 'Iniciar servicio',
    IN_PROGRESS: 'Terminar trabajo',
  }

  return <View style={styles.screen}>
    <TechnicianHeader
      available={availability.data?.available ?? true}
      loading={availability.update.isPending}
      unread={unread.data ?? 0}
      onAvailabilityChange={(value) => availability.update.mutate(value)}
      onMenu={() => setMenu(true)}
      onNotifications={() => navigation.navigate('Notifications')}
    />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <View><Text style={styles.title}>Servicios asignados</Text><Text style={styles.subtitle}>Trabajos que requieren tu atención.</Text></View>
      </View>
      {(advance.error || availability.update.error) && <Text style={styles.error}>{apiMessage(advance.error ?? availability.update.error)}</Text>}
      <QueryState pending={requests.isPending || (paidIds.length > 0 && ratingStatuses.isPending)} error={requests.error ?? ratingStatuses.error} empty={requests.data?.length === 0} emptyText="No tienes servicios asignados activos.">
        {requests.data?.map((item) => <View key={item.id} style={styles.card}>
          <View style={styles.cardHeading}><Text style={styles.category}>{item.categoryName}</Text><Text style={styles.status}>{requestStatusLabels[item.status]}</Text></View>
          <Text style={styles.client}>{item.clientName}</Text>
          <Text style={styles.address}>{item.address}</Text>
          <Text style={styles.address}>Pago: {paymentMethodLabels[item.requestedPaymentMethod] ?? item.requestedPaymentMethod}</Text>
          {actionLabels[item.status] && <Button title={actionLabels[item.status]!} onPress={() => next(item)} loading={advance.isPending} />}
          {item.status === 'PAID' && ratingStatuses.data?.[item.id] === false && <Button title="Calificar cliente" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}
          <View style={styles.actions}>
            <Pressable onPress={() => navigation.navigate('Chat', { requestId: item.id })}><Text style={styles.link}>Abrir chat</Text></Pressable>
            <Pressable onPress={() => navigation.navigate('ServiceSupport', { requestId: item.id })}><Text style={styles.link}>Evidencias y pagos</Text></Pressable>
          </View>
        </View>)}
      </QueryState>
    </ScrollView>
    <TechnicianFooter active="available" onSelect={(tab) => navigation.navigate(tab === 'available' ? 'AvailableRequests' : 'TechnicianEarnings')} />
    <TechnicianMenu visible={menu} profile={profile.data} onClose={() => setMenu(false)} onNavigate={(screen) => navigation.navigate(screen)}
      onSwitchMode={session?.roles?.includes('CLIENT') ? () => void switchMode('CLIENT').catch((error) => showToast(apiMessage(error), 'error')) : undefined}
      onLogout={logout} />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 30 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  category: { color: colors.text, fontSize: 17, fontWeight: '900', flex: 1 },
  status: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  client: { color: '#DCE6F3', fontWeight: '700', marginTop: 10 },
  address: { color: colors.muted, marginTop: 4, marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  link: { color: colors.brand, fontWeight: '800', paddingVertical: 6 },
  error: { color: '#be123c', marginBottom: 10 },
})
