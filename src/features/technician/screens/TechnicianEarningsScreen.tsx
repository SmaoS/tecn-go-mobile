import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { colors } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { apiMessage } from '../../../shared/apiMessage'
import { formatCopCurrency } from '../../../shared/format'
import type { RootStackParamList } from '../../../types'
import { useRechargeTechnicianWallet, useTechnicianEarnings, useTechnicianWallet } from '../../payments/hooks'
import { useTechnicianAvailability, useTechnicianProfile } from '../hooks'
import { TechnicianFooter } from '../components/TechnicianFooter'
import { TechnicianHeader } from '../components/TechnicianHeader'
import { TechnicianMenu } from '../components/TechnicianMenu'
import { useSession } from '../../../context/useSession'
import { useUnreadNotifications } from '../../notifications/hooks'

export function TechnicianEarningsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianEarnings'>) {
  const [menu, setMenu] = useState(false)
  const [showMovements, setShowMovements] = useState(false)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [rechargeAmount, setRechargeAmount] = useState('10000')
  const earnings = useTechnicianEarnings()
  const { wallet, transactions } = useTechnicianWallet()
  const recharge = useRechargeTechnicianWallet()
  const profile = useTechnicianProfile()
  const availability = useTechnicianAvailability()
  const { logout } = useSession()
  const unread = useUnreadNotifications()
  const periodPayments = (earnings.data?.payments ?? []).filter((payment) => inPeriod(payment.createdAt, period))
  const periodTotal = periodPayments.reduce((total, payment) => total + payment.technicianAmount, 0)
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
      <Text style={styles.title}>Cartera</Text>
      {availability.update.error && <Text style={styles.error}>{apiMessage(availability.update.error)}</Text>}
      <QueryState pending={wallet.isPending || transactions.isPending} error={wallet.error ?? transactions.error}>
        {wallet.data && <>
          <View style={styles.summary}>
            <Text style={styles.label}>Saldo disponible</Text>
            <Text style={[styles.amount, wallet.data.balance < 0 && styles.negativeAmount]}>{formatCopCurrency(wallet.data.balance)}</Text>
            <Text style={styles.meta}>{wallet.data.rechargeEnabled ? 'Recarga saldo para cubrir comisiones de plataforma.' : 'Las recargas están deshabilitadas temporalmente.'}</Text>
            {wallet.data.blocked && <Text style={styles.error}>Debes recargar para volver a cotizar servicios.</Text>}
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={rechargeAmount}
              onChangeText={(value) => setRechargeAmount(value.replace(/\D/g, ''))}
              editable={wallet.data.rechargeEnabled && !recharge.isPending}
              placeholder="Valor a recargar"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.meta}>Mínimo {formatCopCurrency(wallet.data.minRechargeAmount)} · Máximo {formatCopCurrency(wallet.data.maxRechargeAmount)}</Text>
            {recharge.error && <Text style={styles.error}>{apiMessage(recharge.error)}</Text>}
            <Pressable
              style={[styles.button, (!wallet.data.rechargeEnabled || recharge.isPending || Number(rechargeAmount) <= 0) && styles.buttonDisabled]}
              disabled={!wallet.data.rechargeEnabled || recharge.isPending || Number(rechargeAmount) <= 0}
              onPress={() => recharge.mutate(Number(rechargeAmount))}
            >
              <Text style={styles.buttonText}>{recharge.isPending ? 'Creando recarga...' : 'Recargar con Wompi'}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.secondaryButton} onPress={() => setShowMovements((value) => !value)}>
            <Text style={styles.secondaryButtonText}>{showMovements ? 'Ocultar movimientos' : 'Ver movimientos de saldo'}</Text>
          </Pressable>
          {showMovements && <>
            <Text style={styles.sectionTitle}>Movimientos de saldo</Text>
            {transactions.data?.length === 0 && <Text style={styles.meta}>Aún no tienes movimientos.</Text>}
            {transactions.data?.map((item) => <View key={item.id} style={styles.row}>
              <View style={styles.rowContent}><Text style={styles.rowTitle}>{transactionLabel(item.type)}</Text><Text style={styles.meta}>{new Date(item.createdAt).toLocaleDateString()}</Text>{item.description && <Text style={styles.meta}>{item.description}</Text>}</View>
              <Text style={[styles.rowAmount, item.amount < 0 && styles.negativeAmount]}>{formatCopCurrency(item.amount)}</Text>
            </View>)}
          </>}
        </>}
      </QueryState>
      <QueryState pending={earnings.isPending} error={earnings.error}>
        {earnings.data && <>
          <Text style={styles.sectionTitle}>Ganancias por servicios</Text>
          <View style={styles.periodSwitch}>
            <Pressable style={[styles.periodButton, period === 'week' && styles.periodButtonActive]} onPress={() => setPeriod('week')}><Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>Semana</Text></Pressable>
            <Pressable style={[styles.periodButton, period === 'month' && styles.periodButtonActive]} onPress={() => setPeriod('month')}><Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>Mes</Text></Pressable>
          </View>
          <View style={styles.summary}><Text style={styles.label}>{period === 'week' ? 'Total recibido esta semana' : 'Total recibido este mes'}</Text><Text style={styles.amount}>{formatCopCurrency(periodTotal)}</Text><Text style={styles.meta}>{periodPayments.length} pagos en el periodo · {earnings.data.paymentCount} pagos históricos</Text></View>
          {periodPayments.length === 0 && <Text style={styles.meta}>No tienes ganancias registradas en este periodo.</Text>}
          {periodPayments.map((payment) => <View key={payment.paymentId} style={styles.row}>
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
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 18 },
  summary: { backgroundColor: colors.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 18 },
  label: { color: colors.muted, fontWeight: '700' },
  amount: { color: colors.text, fontSize: 32, fontWeight: '900', marginTop: 6 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowTitle: { color: colors.text, fontWeight: '800' },
  rowAmount: { color: colors.brand, fontWeight: '900' },
  error: { color: '#be123c', marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginBottom: 12, marginTop: 8 },
  negativeAmount: { color: '#be123c' },
  input: { backgroundColor: colors.bg, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontWeight: '800', marginTop: 16, paddingHorizontal: 14, paddingVertical: 12 },
  button: { alignItems: 'center', backgroundColor: colors.brand, borderRadius: 14, marginTop: 14, paddingVertical: 14 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.bg, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', borderColor: colors.brand, borderRadius: 14, borderWidth: 1, marginBottom: 14, paddingVertical: 13 },
  secondaryButtonText: { color: colors.brand, fontWeight: '900' },
  periodSwitch: { backgroundColor: colors.card, borderRadius: 16, flexDirection: 'row', gap: 6, marginBottom: 12, padding: 4 },
  periodButton: { flex: 1, alignItems: 'center', borderRadius: 12, paddingVertical: 10 },
  periodButtonActive: { backgroundColor: colors.dark },
  periodText: { color: colors.muted, fontWeight: '900' },
  periodTextActive: { color: colors.brand },
  rowContent: { flex: 1, paddingRight: 10 },
})

function inPeriod(value: string, period: 'week' | 'month') {
  const date = new Date(value)
  const now = new Date()
  if (Number.isNaN(date.getTime())) return false
  if (period === 'month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  const start = startOfWeek(now)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return date >= start && date < end
}

function startOfWeek(value: Date) {
  const start = new Date(value)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return start
}

function transactionLabel(type: string) {
  const labels: Record<string, string> = {
    RECHARGE_PENDING: 'Recarga pendiente',
    RECHARGE_APPROVED: 'Recarga aprobada',
    RECHARGE_REJECTED: 'Recarga rechazada',
    COMMISSION_DEBIT: 'Comisión descontada',
    COMMISSION_REFUND: 'Reembolso de comisión',
    ADMIN_ADJUSTMENT: 'Ajuste administrativo',
  }
  return labels[type] ?? type
}
