import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, colors, styles } from '../../../components/UI'
import { PrivateImage } from '../../../components/PrivateImage'
import { useUnreadNotifications } from '../../notifications/hooks'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useClientRequests, useRecentClientQuotes } from '../hooks'
import { requestStatusLabels } from '../status'
import { useDoubleBackExit } from '../../../hooks/useDoubleBackExit'
import { ClientFooter } from '../components/ClientFooter'
import { ClientHeader } from '../components/ClientHeader'
import { ClientMenu } from '../components/ClientMenu'
import { useProfile } from '../../profile/hooks'
import { useSession } from '../../../context/useSession'
import { formatCopCurrency } from '../../../shared/format'
import { showToast } from '../../../components/Toast'
import { apiMessage } from '../../../shared/apiMessage'

export function ClientHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  useDoubleBackExit()
  const [menu, setMenu] = useState(false)
  const requests = useClientRequests()
  const recentQuotes = useRecentClientQuotes(requests.data ?? [])
  const hasPendingQuoteRequests = (requests.data ?? []).some((item) => item.status === 'QUOTE_PENDING')
  const unread = useUnreadNotifications()
  const profile = useProfile()
  const { logout, session, switchMode } = useSession()
  const { width } = useWindowDimensions()
  const cardWidth = width >= 700 ? '48.5%' : '100%'
  const recentRequests = (requests.data ?? []).slice(0, 5)
  return <View style={screenStyles.screen}>
    <ClientHeader unread={unread.data ?? 0} onMenu={() => setMenu(true)} onNotifications={() => navigation.navigate('Notifications')} />
    <ScrollView contentContainerStyle={screenStyles.content}>      
      <Button title="Solicitar servicio" onPress={() => navigation.navigate('RequestService')} />
      <Pressable onPress={() => navigation.navigate('NearbyTechnicians')}><Text style={screenStyles.nearby}>Ver técnicos cercanos</Text></Pressable>
      {(recentQuotes.data?.length ?? 0) > 0 && <><Text style={screenStyles.sectionLabel}>Cotizaciones recientes</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {recentQuotes.data?.map(({ request, quote }) => <Pressable key={quote.id} style={{ width: cardWidth }} onPress={() => navigation.navigate('RequestDetail', { request })}>
          <Card style={screenStyles.compactCard}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {quote.technicianProfilePhotoUrl
              ? <PrivateImage url={quote.technicianProfilePhotoUrl} style={{ width: 44, height: 44, borderRadius: 22 }} />
              : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}><Text style={styles.cardTitle}>{quote.technicianName.charAt(0)}</Text></View>}
            <View style={{ flex: 1 }}><Text style={styles.cardTitle} numberOfLines={1}>{quote.technicianName}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{quote.technicianDocumentsVerified && <Text style={{ color: colors.brand, fontWeight: '900', fontSize: 12 }}>✓ Verificado</Text>}{quote.certifiedTechnician && <Text style={{ color: colors.brand, fontWeight: '900', fontSize: 12 }}>✓ Titulado</Text>}</View><Text style={styles.muted} numberOfLines={1}>{request.categoryName}</Text><Text style={[styles.cardTitle, { color: colors.brand }]}>{formatCopCurrency(quote.price)}</Text></View>
          </View></Card>
        </Pressable>)}
      </View>
    </>}
    <Text style={screenStyles.sectionLabel}>Solicitudes recientes</Text>
    <QueryState pending={requests.isPending || (hasPendingQuoteRequests && recentQuotes.isPending)} error={requests.error ?? recentQuotes.error ?? unread.error} empty={requests.data?.length === 0} emptyText="Aún no tienes solicitudes.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{recentRequests.map((item) => <Pressable key={item.id} style={{ width: cardWidth }} onPress={() => navigation.navigate('RequestDetail', { request: item })}><Card style={screenStyles.compactCard}><View style={screenStyles.cardHeader}><Text style={styles.cardTitle} numberOfLines={1}>{item.categoryName}</Text><Text style={screenStyles.statusText}>{requestStatusLabels[item.status]}</Text></View><Text style={styles.muted} numberOfLines={2}>{item.description}</Text>{item.finalPrice != null && <Text style={screenStyles.price}>{formatCopCurrency(item.finalPrice)}</Text>}</Card></Pressable>)}</View>
      {(requests.data?.length ?? 0) > recentRequests.length && <Pressable onPress={() => navigation.navigate('ClientRequests')}><Text style={screenStyles.viewAll}>Ver todas mis solicitudes</Text></Pressable>}
    </QueryState>
    </ScrollView>
    <ClientFooter active="request" onSelect={(tab) => navigation.navigate(tab === 'request' ? 'Home' : 'ClientRequests')} />
    <ClientMenu visible={menu} profile={profile.data} onClose={() => setMenu(false)} onNavigate={(screen) => navigation.navigate(screen)}
      onSwitchMode={() => void switchMode('TECHNICIAN').catch((error) => showToast(apiMessage(error), 'error'))}
      onLogout={logout} />
  </View>
}

const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 18 },
  nearby: { color: colors.brand, fontWeight: '900', textAlign: 'center', paddingVertical: 16 },
  sectionLabel: { color: colors.text, fontWeight: '900', marginTop: 18, marginBottom: 10 },
  compactCard: { padding: 12, marginBottom: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' },
  statusText: { color: colors.brand, fontSize: 11, fontWeight: '900', maxWidth: 110, textAlign: 'right' },
  price: { color: colors.text, fontWeight: '900', marginTop: 6 },
  viewAll: { color: colors.brand, fontWeight: '900', paddingVertical: 14, textAlign: 'center' },
})
