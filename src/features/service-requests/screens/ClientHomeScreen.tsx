import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { PrivateImage } from '../../../components/PrivateImage'
import { useUnreadNotifications } from '../../notifications/hooks'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useClientRequests, useRecentClientQuotes } from '../hooks'
import { requestStatusLabels } from '../status'

export function ClientHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const requests = useClientRequests()
  const recentQuotes = useRecentClientQuotes(requests.data ?? [])
  const hasPendingQuoteRequests = (requests.data ?? []).some((item) => item.status === 'QUOTE_PENDING')
  const unread = useUnreadNotifications()
  const { width } = useWindowDimensions()
  const cardWidth = width >= 700 ? '48.5%' : '100%'
  return <KeyboardAwareScreen><Text style={styles.title}>¿Qué necesitas?</Text><Text style={styles.subtitle}>Encuentra ayuda técnica confiable.</Text>
    <Button title="Solicitar servicio" onPress={() => navigation.navigate('RequestService')} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 }}>
      <Pressable onPress={() => navigation.navigate('NearbyTechnicians')}><Text style={styles.link}>Técnicos cercanos</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Profile')}><Text style={styles.link}>Mi perfil</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Notifications')}><Text style={styles.link}>Notificaciones{(unread.data ?? 0) > 0 ? ` (${unread.data})` : ''}</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Legal')}><Text style={styles.link}>Seguridad</Text></Pressable>
    </View>
    {(recentQuotes.data?.length ?? 0) > 0 && <><Text style={styles.label}>Cotizaciones recientes</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {recentQuotes.data?.map(({ request, quote }) => <Pressable key={quote.id} style={{ width: cardWidth }} onPress={() => navigation.navigate('RequestDetail', { request })}>
          <Card style={{ height: '100%' }}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {quote.technicianProfilePhotoUrl
              ? <PrivateImage url={quote.technicianProfilePhotoUrl} style={{ width: 52, height: 52, borderRadius: 26 }} />
              : <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}><Text style={styles.cardTitle}>{quote.technicianName.charAt(0)}</Text></View>}
            <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{quote.technicianName}</Text><Text style={styles.muted}>{request.categoryName}</Text><Text style={[styles.cardTitle, { color: colors.brand }]}>${quote.price.toLocaleString()}</Text></View>
          </View></Card>
        </Pressable>)}
      </View>
    </>}
    <Text style={styles.label}>Solicitudes recientes</Text>
    <QueryState pending={requests.isPending || (hasPendingQuoteRequests && recentQuotes.isPending)} error={requests.error ?? recentQuotes.error ?? unread.error} empty={requests.data?.length === 0} emptyText="Aún no tienes solicitudes.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{requests.data?.map((item) => <Pressable key={item.id} style={{ width: cardWidth }} onPress={() => navigation.navigate('RequestDetail', { request: item })}><Card style={{ height: '100%' }}><Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.muted}>{item.description}</Text><Text style={[styles.muted, { color: colors.brand }]}>{requestStatusLabels[item.status]}</Text></Card></Pressable>)}</View>
    </QueryState>
  </KeyboardAwareScreen>
}
