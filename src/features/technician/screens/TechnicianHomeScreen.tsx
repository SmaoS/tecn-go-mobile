import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Screen, colors, styles } from '../../../components/UI'
import { useUnreadNotifications } from '../../notifications/hooks'
import { useTechnicianEarnings } from '../../payments/hooks'
import { requestKeys, useAssignedRequests } from '../../service-requests/hooks'
import { serviceRequestApi } from '../../service-requests/api'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RequestStatus, RootStackParamList, ServiceRequest } from '../../../types'
import { technicianApi } from '../api'

export function TechnicianHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianHome'>) {
  const client = useQueryClient()
  const [locationOnline, setLocationOnline] = useState(false)
  const [locationError, setLocationError] = useState('')
  const requests = useAssignedRequests()
  const earnings = useTechnicianEarnings()
  const unread = useUnreadNotifications()
  const advance = useMutation({
    mutationFn: ({ item, status }: { item: ServiceRequest; status: RequestStatus }) =>
      serviceRequestApi.status(item.id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: requestKeys.assigned }),
  })

  useEffect(() => {
    if (!locationOnline) return
    let active = true
    const send = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync()
        if (!permission.granted || !active) return
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        await technicianApi.location({
          latitude: location.coords.latitude, longitude: location.coords.longitude,
          accuracy: location.coords.accuracy, speed: location.coords.speed,
          heading: location.coords.heading, online: true,
        })
      } catch (error) { if (active) setLocationError(apiMessage(error)) }
    }
    void send()
    const interval = setInterval(() => void send(), 10_000)
    return () => { active = false; clearInterval(interval) }
  }, [locationOnline])

  async function toggleLocation() {
    if (!locationOnline) {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) { setLocationError('Debes permitir la ubicación'); return }
      setLocationOnline(true)
      return
    }
    setLocationOnline(false)
    const location = await Location.getLastKnownPositionAsync()
    if (location) await technicianApi.location({
      latitude: location.coords.latitude, longitude: location.coords.longitude, online: false,
    })
  }
  function next(item: ServiceRequest) {
    const states: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED',
    }
    const status = states[item.status]
    if (status) advance.mutate({ item, status })
  }
  const actionLabels: Partial<Record<RequestStatus, string>> = {
    QUOTE_ACCEPTED: 'Voy en camino', ON_THE_WAY: 'Ya llegué',
    ARRIVED: 'Iniciar servicio', IN_PROGRESS: 'Completar servicio',
  }

  return <Screen><Text style={styles.title}>Panel técnico</Text><Text style={styles.subtitle}>Gestiona tu perfil y servicios.</Text>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}><View style={{ flex: 1 }}><Button title="Mi perfil" onPress={() => navigation.navigate('TechnicianProfile')} /></View><View style={{ flex: 1 }}><Button title="Disponibles" onPress={() => navigation.navigate('AvailableRequests')} /></View></View>
    <Button title={`Notificaciones${(unread.data ?? 0) > 0 ? ` (${unread.data})` : ''}`} onPress={() => navigation.navigate('Notifications')} />
    <Button title={locationOnline ? 'Ubicación activa · Desactivar' : 'Activar ubicación'} onPress={toggleLocation} />
    <Button title="Mi cuenta / cerrar sesión" onPress={() => navigation.navigate('Profile')} />
    {(locationError || advance.error) && <Text style={styles.error}>{locationError || apiMessage(advance.error)}</Text>}
    <QueryState pending={earnings.isPending} error={earnings.error}>{earnings.data && <Card><Text style={styles.cardTitle}>Mis ganancias</Text><Text style={[styles.title, { color: colors.brand }]}>${earnings.data.totalTechnicianAmount.toLocaleString()}</Text><Text style={styles.muted}>{earnings.data.paymentCount} pagos · comisión de plataforma ${earnings.data.totalPlatformFee.toLocaleString()}</Text></Card>}</QueryState>
    <Text style={styles.label}>Servicios asignados</Text>
    <QueryState pending={requests.isPending} error={requests.error ?? unread.error} empty={requests.data?.length === 0} emptyText="No tienes servicios asignados.">
      <FlatList data={requests.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Card><Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.muted}>{item.clientName} · {item.address}</Text><Text style={[styles.muted, { color: colors.brand }]}>{item.status}</Text>
        {actionLabels[item.status] && <Button title={actionLabels[item.status]!} onPress={() => next(item)} loading={advance.isPending} />}
        {item.status === 'PAID' && <Button title="Calificar cliente" onPress={() => navigation.navigate('Rating', { requestId: item.id })} />}
        <Button title="Abrir chat" onPress={() => navigation.navigate('Chat', { requestId: item.id })} /></Card>} />
    </QueryState>
  </Screen>
}
