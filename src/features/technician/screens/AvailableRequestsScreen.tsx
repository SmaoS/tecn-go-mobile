import { useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList, ServiceRequest } from '../../../types'
import { useDoubleBackExit } from '../../../hooks/useDoubleBackExit'
import { useAvailableRequests } from '../../service-requests/hooks'
import { useTechnicianAvailability, useTechnicianProfile } from '../hooks'
import { AvailableRequestItem } from '../components/AvailableRequestItem'
import { AvailableRequestDetailModal } from '../components/AvailableRequestDetailModal'
import { TechnicianFooter } from '../components/TechnicianFooter'
import { TechnicianHeader } from '../components/TechnicianHeader'
import { TechnicianMenu } from '../components/TechnicianMenu'
import { apiMessage } from '../../../shared/apiMessage'
import { useSession } from '../../../context/useSession'

export function AvailableRequestsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AvailableRequests'>) {
  useDoubleBackExit()
  const [menu, setMenu] = useState(false)
  const [selected, setSelected] = useState<ServiceRequest | null>(null)
  const radiusKm = '10'
  const availability = useTechnicianAvailability()
  const available = availability.data?.available ?? true
  const requests = useAvailableRequests(radiusKm)
  const profile = useTechnicianProfile()
  const { logout } = useSession()

  return <View style={styles.screen}>
    <TechnicianHeader
      available={available}
      loading={availability.update.isPending}
      onAvailabilityChange={(value) => availability.update.mutate(value)}
      onMenu={() => setMenu(true)}
    />
    <View style={styles.heading}>
      <Text style={styles.title}>Solicitudes disponibles</Text>
      <Text style={styles.subtitle}>{available ? 'Ofertas cercanas actualizadas cada 10 segundos' : 'Modo ocupado: puedes ver ofertas, pero no recibirás avisos nuevos'}</Text>
    </View>
    {availability.error || availability.update.error
      ? <Text style={styles.error}>{apiMessage(availability.error ?? availability.update.error)}</Text>
      : requests.isPending
        ? <View style={styles.center}><ActivityIndicator color="#0891b2" /><Text style={styles.empty}>Buscando solicitudes cercanas...</Text></View>
        : requests.error
          ? <View style={styles.center}><Text style={styles.error}>{apiMessage(requests.error)}</Text></View>
          : <FlatList
            data={requests.data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AvailableRequestItem request={item} onPress={() => setSelected(item)} />}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={requests.isRefetching} onRefresh={() => void requests.refetch()} />}
            ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No hay solicitudes cercanas por ahora.</Text></View>}
          />}
    <TechnicianFooter active="available" onSelect={(tab) => tab === 'earnings' && navigation.navigate('TechnicianEarnings')} />
    <TechnicianMenu visible={menu} profile={profile.data} onClose={() => setMenu(false)} onNavigate={(screen) => navigation.navigate(screen)} onLogout={logout} />
    <AvailableRequestDetailModal request={selected} radiusKm={radiusKm} onClose={() => setSelected(null)} />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  heading: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, backgroundColor: '#fff' },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 12, marginTop: 4 },
  list: { flexGrow: 1, paddingBottom: 18 },
  center: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 10 },
  error: { color: '#be123c', textAlign: 'center', padding: 16 },
})
