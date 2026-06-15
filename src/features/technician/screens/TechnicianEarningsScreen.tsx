import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { QueryState } from '../../../shared/QueryState'
import { formatCopCurrency } from '../../../shared/format'
import type { RootStackParamList } from '../../../types'
import { useTechnicianEarnings } from '../../payments/hooks'
import { useTechnicianAvailability, useTechnicianProfile } from '../hooks'
import { TechnicianFooter } from '../components/TechnicianFooter'
import { TechnicianHeader } from '../components/TechnicianHeader'
import { TechnicianMenu } from '../components/TechnicianMenu'
import { useSession } from '../../../context/useSession'

export function TechnicianEarningsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianEarnings'>) {
  const [menu, setMenu] = useState(false)
  const earnings = useTechnicianEarnings()
  const profile = useTechnicianProfile()
  const availability = useTechnicianAvailability()
  const { logout } = useSession()
  return <View style={styles.screen}>
    <TechnicianHeader
      available={availability.data?.available ?? true}
      loading={availability.update.isPending}
      onAvailabilityChange={(value) => availability.update.mutate(value)}
      onMenu={() => setMenu(true)}
    />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cartera</Text>
      <QueryState pending={earnings.isPending} error={earnings.error}>
        {earnings.data && <>
          <View style={styles.summary}><Text style={styles.label}>Total recibido</Text><Text style={styles.amount}>{formatCopCurrency(earnings.data.totalTechnicianAmount)}</Text><Text style={styles.meta}>{earnings.data.paymentCount} pagos registrados</Text></View>
          {earnings.data.payments.map((payment) => <View key={payment.paymentId} style={styles.row}>
            <View><Text style={styles.rowTitle}>Servicio pagado</Text><Text style={styles.meta}>{new Date(payment.createdAt).toLocaleDateString()}</Text></View>
            <Text style={styles.rowAmount}>{formatCopCurrency(payment.technicianAmount)}</Text>
          </View>)}
        </>}
      </QueryState>
    </ScrollView>
    <TechnicianFooter active="earnings" onSelect={(tab) => tab === 'available' && navigation.navigate('AvailableRequests')} />
    <TechnicianMenu visible={menu} profile={profile.data} onClose={() => setMenu(false)} onNavigate={(screen) => navigation.navigate(screen)} onLogout={logout} />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 18, paddingBottom: 30 },
  title: { color: '#0f172a', fontSize: 28, fontWeight: '900', marginBottom: 18 },
  summary: { backgroundColor: '#fff', borderRadius: 18, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', marginBottom: 18 },
  label: { color: '#64748b', fontWeight: '700' },
  amount: { color: '#0f172a', fontSize: 32, fontWeight: '900', marginTop: 6 },
  meta: { color: '#64748b', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  rowTitle: { color: '#1e293b', fontWeight: '800' },
  rowAmount: { color: '#0e7490', fontWeight: '900' },
})
