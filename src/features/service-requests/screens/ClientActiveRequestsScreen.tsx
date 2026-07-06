import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Card, colors, styles as uiStyles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { useDoubleBackExit } from '../../../hooks/useDoubleBackExit'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { useUnreadNotifications } from '../../notifications/hooks'
import { useProfile } from '../../profile/hooks'
import { requestStatusLabels } from '../status'
import { useClientRequests } from '../hooks'
import { useRatingStatuses } from '../../ratings/hooks'
import { ClientFooter } from '../components/ClientFooter'
import { ClientHeader } from '../components/ClientHeader'
import { ClientMenu } from '../components/ClientMenu'
import { showToast } from '../../../components/Toast'
import { apiMessage } from '../../../shared/apiMessage'

export function ClientActiveRequestsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ClientRequests'>) {
  useDoubleBackExit()
  const [menu, setMenu] = useState(false)
  const requests = useClientRequests()
  const unread = useUnreadNotifications()
  const profile = useProfile()
  const { logout, session, switchMode } = useSession()
  const { width } = useWindowDimensions()
  const cardWidth = width >= 700 ? '48.5%' : '100%'
  const paidIds = (requests.data ?? []).filter((item) => item.status === 'PAID').map((item) => item.id)
  const ratingStatuses = useRatingStatuses(paidIds)
  const openedRating = useRef(false)

  useEffect(() => {
    if (openedRating.current || !ratingStatuses.data) return
    const requestId = paidIds.find((id) => ratingStatuses.data?.[id] === false)
    if (!requestId) return
    openedRating.current = true
    navigation.navigate('Rating', { requestId })
  }, [navigation, paidIds, ratingStatuses.data])

  return <View style={screenStyles.screen}>
    <ClientHeader unread={unread.data ?? 0} onMenu={() => setMenu(true)} onNotifications={() => navigation.navigate('Notifications')} />
    <ScrollView contentContainerStyle={screenStyles.content}>
      <Text style={screenStyles.title}>Mis solicitudes activas</Text>
      <Text style={screenStyles.subtitle}>Seguimiento de servicios en curso y cotizaciones pendientes.</Text>
      <QueryState pending={requests.isPending || (paidIds.length > 0 && ratingStatuses.isPending)} error={requests.error ?? ratingStatuses.error} empty={requests.data?.length === 0} emptyText="No tienes solicitudes activas.">
        <View style={screenStyles.grid}>
          {requests.data?.map((item) => <Pressable key={item.id} style={{ width: cardWidth }} onPress={() => navigation.navigate('RequestDetail', { request: item })}>
            <Card style={screenStyles.compactCard}>
              <View style={screenStyles.cardHeader}>
                <Text style={uiStyles.cardTitle} numberOfLines={1}>{item.categoryName}</Text>
                <Text style={screenStyles.statusText}>{requestStatusLabels[item.status]}</Text>
              </View>
              <Text style={uiStyles.muted} numberOfLines={2}>{item.description}</Text>
              {item.finalPrice != null && <Text style={uiStyles.cardTitle}>${item.finalPrice.toLocaleString()}</Text>}
            </Card>
          </Pressable>)}
        </View>
      </QueryState>
    </ScrollView>
    <ClientFooter active="requests" onSelect={(tab) => navigation.navigate(tab === 'request' ? 'Home' : 'ClientRequests')} />
    <ClientMenu visible={menu} profile={profile.data} onClose={() => setMenu(false)} onNavigate={(screen) => navigation.navigate(screen)}
      onSwitchMode={() => void switchMode('TECHNICIAN').catch((error) => showToast(apiMessage(error), 'error'))}
      onLogout={logout} />
  </View>
}

const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  compactCard: { padding: 12, marginBottom: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' },
  statusText: { color: colors.brand, fontSize: 11, fontWeight: '900', maxWidth: 110, textAlign: 'right' },
})
